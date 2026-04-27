import { CompanyRepository } from '../repositories';
import { JobRepository } from '../repositories';
import { CreateCompanyInput, UpdateCompanyInput } from '../validators/company.validator';
import { JobStatus } from '@prisma/client';

export class CompanyService {
  constructor(
    private companyRepository: CompanyRepository,
    private jobRepository: JobRepository
  ) {}

  /**
   * Create a new company
   */
  async createCompany(data: CreateCompanyInput) {
    // Check if company with same name already exists
    const existingCompanies = await this.companyRepository.findByName(data.name);
    if (existingCompanies && existingCompanies.length > 0) {
      throw new Error('Company with this name already exists');
    }

    const company = await this.companyRepository.create(data);
    return company;
  }

  /**
   * Get company by ID
   */
  async getCompanyById(id: string) {
    const companies = await this.companyRepository.findMany({
      where: { id },
      include: {
        jobs: {
          where: { status: JobStatus.APPROVED },
          take: 5, // Limit to 5 recent jobs
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (!companies || companies.length === 0) {
      throw new Error('Company not found');
    }

    return companies[0];
  }

  /**
   * Update company
   */
  async updateCompany(id: string, data: UpdateCompanyInput) {
    const company = await this.companyRepository.findById(id);
    if (!company) {
      throw new Error('Company not found');
    }

    // If name is being updated, check for duplicates
    if (data.name && data.name !== company.name) {
      const existingCompanies = await this.companyRepository.findByName(data.name);
      if (existingCompanies && existingCompanies.length > 0) {
        throw new Error('Company with this name already exists');
      }
    }

    const updatedCompany = await this.companyRepository.update(id, data);
    return updatedCompany;
  }

  /**
   * Delete company
   */
  async deleteCompany(id: string) {
    const company = await this.companyRepository.findById(id);
    if (!company) {
      throw new Error('Company not found');
    }

    // Check if company has jobs
    const companyJobs = await this.jobRepository.findByCompany(id);
    if (companyJobs && companyJobs.length > 0) {
      throw new Error('Cannot delete company with existing jobs');
    }

    await this.companyRepository.delete(id);
    return { success: true };
  }

  /**
   * List companies with pagination and search
   */
  async listCompanies(params: {
    page?: number;
    limit?: number;
    search?: string;
  }) {
    const page = params.page || 1;
    const limit = params.limit || 20;
    const skip = (page - 1) * limit;

    const where: any = {};

    if (params.search) {
      where.name = { contains: params.search };
    }

    const [companies, total] = await Promise.all([
      this.companyRepository.findMany({
        where,
        include: {
          _count: {
            select: { jobs: true },
          },
        },
        orderBy: { name: 'asc' },
        skip,
        take: limit,
      }),
      this.companyRepository.count({ where }),
    ]);

    const totalPages = Math.ceil(total / limit);

    return {
      data: companies,
      total,
      page,
      limit,
      totalPages,
    };
  }

  /**
   * Get company jobs with pagination
   */
  async getCompanyJobs(companyId: string, params: {
    page?: number;
    limit?: number;
    status?: JobStatus;
  }) {
    const page = params.page || 1;
    const limit = params.limit || 20;
    const skip = (page - 1) * limit;

    // Verify company exists
    const company = await this.companyRepository.findById(companyId);
    if (!company) {
      throw new Error('Company not found');
    }

    const where: any = {
      companyId,
    };

    // Default to APPROVED jobs for public access
    if (params.status) {
      where.status = params.status;
    } else {
      where.status = JobStatus.APPROVED;
    }

    const [jobs, total] = await Promise.all([
      this.jobRepository.findMany({
        where,
        include: {
          employer: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              avatarUrl: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      this.jobRepository.count({ where }),
    ]);

    const totalPages = Math.ceil(total / limit);

    return {
      data: jobs,
      total,
      page,
      limit,
      totalPages,
    };
  }
}