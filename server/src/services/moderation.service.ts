import { JobRepository } from '../repositories/job.repository';
import { CompanyRepository } from '../repositories/company.repository';
import { UserRepository } from '../repositories/user.repository';
import { ApplicationRepository } from '../repositories/application.repository';
import { CacheService } from '../utils/cache';
import {
  ModerateJobInput,
  ModerateCompanyInput,
  ModerateUserInput,
  ModerateApplicationInput,
  HandleReportInput,
  FlagContentInput,
} from '../validators/moderation.validator';
import { PrismaClient } from '@prisma/client';

export class ModerationService {
  constructor(
    private jobRepository: JobRepository,
    private companyRepository: CompanyRepository,
    private userRepository: UserRepository,
    private applicationRepository: ApplicationRepository,
    private cacheService: CacheService,
    private prisma: PrismaClient
  ) {}

  // Get pending jobs for moderation
  async getPendingJobs(page: number = 1, limit: number = 20) {
    const skip = (page - 1) * limit;
    
    const [jobs, total] = await Promise.all([
      this.prisma.job.findMany({
        where: { status: 'PENDING' },
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          employer: {
            select: {
              id: true,
              email: true,
              firstName: true,
              lastName: true,
            },
          },
          company: {
            select: {
              id: true,
              name: true,
              logoUrl: true,
            },
          },
        },
      }),
      this.prisma.job.count({ where: { status: 'PENDING' } }),
    ]);

    return {
      jobs,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  // Get pending companies for moderation
  async getPendingCompanies(page: number = 1, limit: number = 20) {
    const skip = (page - 1) * limit;
    
    // Note: Company model doesn't have status field in current schema
    // So we'll return all companies for now, or we can filter by some other criteria
    const [companies, total] = await Promise.all([
      this.prisma.company.findMany({
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          // Company doesn't have owner relation in current schema
        },
      }),
      this.prisma.company.count(),
    ]);

    return {
      companies,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  // Moderate a job
  async moderateJob(jobId: string, _adminId: string, data: ModerateJobInput) {
    const job = await this.jobRepository.findById(jobId);
    
    if (!job) {
      throw new Error('Job not found');
    }

    // Update job status only (other fields don't exist in schema)
    const updateData: any = {
      status: data.status,
    };

    const updatedJob = await this.jobRepository.update(jobId, updateData);
    
    // Clear cache for this job and job listings
    await this.cacheService.del(`job:${jobId}`);
    await this.cacheService.flush(); // Clear all job-related cache

    return updatedJob;
  }

  // Moderate a company
  async moderateCompany(companyId: string, _adminId: string, _data: ModerateCompanyInput) {
    const company = await this.companyRepository.findById(companyId);
    
    if (!company) {
      throw new Error('Company not found');
    }

    // Company model doesn't have status field in current schema
    // So we'll just update basic fields if needed
    const updateData: any = {
      // Add any company fields that can be moderated
    };

    const updatedCompany = await this.companyRepository.update(companyId, updateData);
    
    // Clear cache for this company
    await this.cacheService.del(`company:${companyId}`);

    return updatedCompany;
  }

  // Moderate a user
  async moderateUser(userId: string, _adminId: string, _data: ModerateUserInput) {
    const user = await this.userRepository.findById(userId);
    
    if (!user) {
      throw new Error('User not found');
    }

    // User model doesn't have moderation fields in current schema
    // We can only update basic user info
    const updateData: any = {};

    const updatedUser = await this.userRepository.update(userId, updateData);
    
    // Clear cache for this user
    await this.cacheService.del(`user:profile:${userId}`);

    return updatedUser;
  }

  // Moderate an application
  async moderateApplication(applicationId: string, _adminId: string, data: ModerateApplicationInput) {
    const application = await this.applicationRepository.findById(applicationId);
    
    if (!application) {
      throw new Error('Application not found');
    }

    const updateData: any = {
      status: data.status,
    };

    const updatedApplication = await this.applicationRepository.update(applicationId, updateData);
    
    // Clear cache for this application
    await this.cacheService.del(`application:${applicationId}`);

    return updatedApplication;
  }

  // Get pending applications for moderation
  async getPendingApplications(page: number = 1, limit: number = 20) {
    const skip = (page - 1) * limit;
    
    const [applications, total] = await Promise.all([
      this.prisma.application.findMany({
        where: { status: 'PENDING' },
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          job: {
            select: {
              id: true,
              title: true,
              company: {
                select: {
                  id: true,
                  name: true,
                },
              },
            },
          },
          seeker: {
            select: {
              id: true,
              email: true,
              firstName: true,
              lastName: true,
            },
          },
        },
      }),
      this.prisma.application.count({ where: { status: 'PENDING' } }),
    ]);

    return {
      applications,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  // Get moderation statistics
  async getModerationStats() {
    const [
      pendingJobs,
      pendingApplications,
    ] = await Promise.all([
      this.prisma.job.count({ where: { status: 'PENDING' } }),
      this.prisma.application.count({ where: { status: 'PENDING' } }),
    ]);

    return {
      pendingJobs,
      pendingApplications,
      totalModerations: pendingJobs + pendingApplications,
    };
  }

  // Get moderation logs
  async getModerationLogs(page: number = 1, limit: number = 20) {
    const skip = (page - 1) * limit;
    
    // Since we don't have moderation logs, we'll return recently updated jobs
    const [jobs, total] = await Promise.all([
      this.prisma.job.findMany({
        skip,
        take: limit,
        orderBy: { updatedAt: 'desc' },
        select: {
          id: true,
          title: true,
          status: true,
          updatedAt: true,
          employer: {
            select: {
              id: true,
              email: true,
              firstName: true,
              lastName: true,
            },
          },
        },
      }),
      this.prisma.job.count(),
    ]);

    return {
      jobLogs: jobs,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  // Flag content for review (simplified - just log to console for now)
  async flagContent(userId: string, data: FlagContentInput) {
    console.log(`Content flagged by user ${userId}:`, data);
    
    // In a real implementation, this would create a record in a content_flag table
    // For now, we'll just return a success message
    return {
      id: 'temp-flag-id',
      contentType: data.contentType,
      contentId: data.contentId,
      reason: data.reason,
      details: data.details,
      reportedBy: userId,
      status: 'PENDING',
      createdAt: new Date(),
    };
  }

  // Handle a reported content flag (simplified)
  async handleReport(flagId: string, adminId: string, data: HandleReportInput) {
    console.log(`Report handled by admin ${adminId}:`, { flagId, data });
    
    // In a real implementation, this would update the content_flag record
    // For now, we'll just return a success message
    return {
      id: flagId,
      status: 'RESOLVED',
      actionTaken: data.action,
      adminNotes: data.adminNotes,
      resolvedAt: new Date(),
      resolvedBy: adminId,
    };
  }

  // Get flagged content (simplified - return empty for now)
  async getFlaggedContent(page: number = 1, limit: number = 20) {
    return {
      flags: [],
      pagination: {
        page,
        limit,
        total: 0,
        totalPages: 0,
      },
    };
  }
}