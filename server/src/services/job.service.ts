import { JobRepository } from '../repositories';
import { CreateJobInput, UpdateJobInput } from '../validators/job.validator';
import { JobStatus } from '@prisma/client';
import { CacheService } from '../utils/cache';

export class JobService {
  constructor(
    private jobRepository: JobRepository,
    private cacheService: CacheService
  ) {}

  /**
   * Create a new job with PENDING status
   */
  async createJob(employerId: string, data: CreateJobInput) {
    // Check if company exists (optional, could be validated in route)
    // Create job with PENDING status
    const job = await this.jobRepository.create({
      ...data,
      employerId,
      status: JobStatus.PENDING,
    });

    // Invalidate cache for job listings (we'll just flush for now)
    await this.cacheService.flush();

    return job;
  }

  /**
   * Get job by ID with company and employer relations
   */
  async getJobById(id: string) {
    // Use findMany with where clause to include relations
    const jobs = await this.jobRepository.findMany({
      where: { id },
      include: {
        company: true,
        employer: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            avatarUrl: true,
          },
        },
      },
    });

    if (!jobs || jobs.length === 0) {
      throw new Error('Job not found');
    }

    return jobs[0];
  }

  /**
   * Update job - only job owner or admin can update
   */
  async updateJob(id: string, employerId: string, data: UpdateJobInput) {
    // Check if job exists and belongs to employer
    const job = await this.jobRepository.findById(id);
    if (!job) {
      throw new Error('Job not found');
    }

    // Authorization check (should be done in middleware, but double-check here)
    if (job.employerId !== employerId) {
      throw new Error('Unauthorized to update this job');
    }

    const updatedJob = await this.jobRepository.update(id, data);

    // Invalidate cache for this job and listings
    await this.cacheService.del(`job:${id}`);
    await this.cacheService.flush();

    return updatedJob;
  }

  /**
   * Delete job - only job owner or admin can delete
   */
  async deleteJob(id: string, employerId: string) {
    // Check if job exists and belongs to employer
    const job = await this.jobRepository.findById(id);
    if (!job) {
      throw new Error('Job not found');
    }

    // Authorization check
    if (job.employerId !== employerId) {
      throw new Error('Unauthorized to delete this job');
    }

    // Soft delete consideration: we'll do hard delete for now
    await this.jobRepository.delete(id);

    // Invalidate cache
    await this.cacheService.del(`job:${id}`);
    await this.cacheService.flush();

    return { success: true };
  }

  /**
   * List jobs with pagination
   * For non-admin users, only show APPROVED jobs
   */
  async listJobs(params: {
    page?: number;
    limit?: number;
    status?: JobStatus;
    employerId?: string;
    companyId?: string;
    type?: string;
    showAll?: boolean;
  }) {
    const page = params.page || 1;
    const limit = params.limit || 20;
    const skip = (page - 1) * limit;

    const where: any = {};

    if (params.status) {
      where.status = params.status;
    }

    if (params.employerId) {
      where.employerId = params.employerId;
    }

    if (params.companyId) {
      where.companyId = params.companyId;
    }

    if (params.type) {
      where.type = params.type;
    }

    // For public listing (no status filter and not employer's own jobs), default to APPROVED
    if (!params.status && !params.employerId && !params.showAll) {
      where.status = JobStatus.APPROVED;
    }

    const [jobs, total] = await Promise.all([
      this.jobRepository.findMany({
        where,
        include: {
          company: true,
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

  /**
   * Search jobs with filters and pagination
   */
  async searchJobs(params: {
    keyword?: string;
    location?: string;
    type?: string;
    salaryMin?: number;
    salaryMax?: number;
    page?: number;
    limit?: number;
    sortBy?: 'createdAt' | 'salary';
    sortOrder?: 'asc' | 'desc';
  }) {
    const page = params.page || 1;
    const limit = params.limit || 20;
    const skip = (page - 1) * limit;

    // Build cache key from search parameters
    const cacheKey = `jobs:search:${JSON.stringify(params)}`;

    // Try to get from cache first
    const cachedResult = await this.cacheService.get(cacheKey);
    if (cachedResult) {
      return cachedResult;
    }

    const where: any = {
      status: JobStatus.APPROVED, // Only show approved jobs in search
    };

    // Keyword search (title OR description)
    if (params.keyword) {
      where.OR = [
        { title: { contains: params.keyword } },
        { description: { contains: params.keyword } },
      ];
    }

    // Location filter
    if (params.location) {
      where.location = { contains: params.location };
    }

    // Job type filter
    if (params.type) {
      where.type = params.type;
    }

    // Salary range filter
    if (params.salaryMin !== undefined || params.salaryMax !== undefined) {
      where.AND = where.AND || [];
      
      if (params.salaryMin !== undefined) {
        where.AND.push({
          OR: [
            { salaryMin: { gte: params.salaryMin } },
            { salaryMax: { gte: params.salaryMin } },
          ],
        });
      }
      
      if (params.salaryMax !== undefined) {
        where.AND.push({
          OR: [
            { salaryMax: { lte: params.salaryMax } },
            { salaryMin: { lte: params.salaryMax } },
          ],
        });
      }
    }

    // Build orderBy
    let orderBy: any = { createdAt: 'desc' }; // Default
    if (params.sortBy === 'salary') {
      orderBy = { salaryMin: params.sortOrder || 'desc' };
    } else if (params.sortBy === 'createdAt') {
      orderBy = { createdAt: params.sortOrder || 'desc' };
    }

    const [jobs, total] = await Promise.all([
      this.jobRepository.findMany({
        where,
        include: {
          company: true,
          employer: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              avatarUrl: true,
            },
          },
        },
        orderBy,
        skip,
        take: limit,
      }),
      this.jobRepository.count({ where }),
    ]);

    const totalPages = Math.ceil(total / limit);

    const result = {
      data: jobs,
      total,
      page,
      limit,
      totalPages,
    };

    // Cache the result for 5 minutes (300 seconds)
    await this.cacheService.set(cacheKey, result, 300);

    return result;
  }
}