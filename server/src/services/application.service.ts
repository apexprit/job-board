import { ApplicationRepository } from '../repositories';
import { JobRepository } from '../repositories';
import { CreateApplicationInput, UpdateApplicationStatusInput } from '../validators/application.validator';
import { ApplicationStatus, JobStatus } from '@prisma/client';

export class ApplicationService {
  constructor(
    private applicationRepository: ApplicationRepository,
    private jobRepository: JobRepository
  ) {}

  /**
   * Apply for a job
   */
  async applyForJob(seekerId: string, jobId: string, data: CreateApplicationInput) {
    // Check if job exists and is APPROVED
    const job = await this.jobRepository.findById(jobId);
    if (!job) {
      throw new Error('Job not found');
    }

    if (job.status !== JobStatus.APPROVED) {
      throw new Error('Job is not available for applications');
    }

    // Check if seeker has already applied for this job
    const existingApplication = await this.applicationRepository.findMany({
      where: {
        jobId,
        seekerId,
      },
    });

    if (existingApplication && existingApplication.length > 0) {
      throw new Error('You have already applied for this job');
    }

    // Create application
    const application = await this.applicationRepository.create({
      jobId,
      seekerId,
      coverLetter: data.coverLetter,
      resumeUrl: data.resumeUrl,
      status: ApplicationStatus.PENDING,
    });

    return application;
  }

  /**
   * Get application by ID with job and seeker details
   */
  async getApplicationById(id: string) {
    const applications = await this.applicationRepository.findMany({
      where: { id },
      include: {
        job: {
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
        },
        seeker: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            avatarUrl: true,
            resumeUrl: true,
          },
        },
      },
    });

    if (!applications || applications.length === 0) {
      throw new Error('Application not found');
    }

    return applications[0];
  }

  /**
   * List applications by seeker (seeker's own applications)
   */
  async listApplicationsBySeeker(seekerId: string, params: {
    page?: number;
    limit?: number;
    status?: ApplicationStatus;
  }) {
    const page = params.page || 1;
    const limit = params.limit || 20;
    const skip = (page - 1) * limit;

    const where: any = { seekerId };

    if (params.status) {
      where.status = params.status;
    }

    const [applications, total] = await Promise.all([
      this.applicationRepository.findMany({
        where,
        include: {
          job: {
            include: {
              company: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      this.applicationRepository.count({ where }),
    ]);

    const totalPages = Math.ceil(total / limit);

    return {
      data: applications,
      total,
      page,
      limit,
      totalPages,
    };
  }

  /**
   * List applications by job (employer's view)
   */
  async listApplicationsByJob(jobId: string, employerId: string, params: {
    page?: number;
    limit?: number;
    status?: ApplicationStatus;
  }) {
    // Verify job belongs to employer
    const job = await this.jobRepository.findById(jobId);
    if (!job) {
      throw new Error('Job not found');
    }

    if (job.employerId !== employerId) {
      throw new Error('Unauthorized to view applications for this job');
    }

    const page = params.page || 1;
    const limit = params.limit || 20;
    const skip = (page - 1) * limit;

    const where: any = { jobId };

    if (params.status) {
      where.status = params.status;
    }

    const [applications, total] = await Promise.all([
      this.applicationRepository.findMany({
        where,
        include: {
          seeker: {
            select: {
              id: true,
              email: true,
              firstName: true,
              lastName: true,
              avatarUrl: true,
              resumeUrl: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      this.applicationRepository.count({ where }),
    ]);

    const totalPages = Math.ceil(total / limit);

    return {
      data: applications,
      total,
      page,
      limit,
      totalPages,
    };
  }

  /**
   * Update application status (employer only)
   */
  async updateApplicationStatus(id: string, employerId: string, data: UpdateApplicationStatusInput) {
    // Get application with job details
    const application = await this.getApplicationById(id);
    
    // Verify job belongs to employer
    if (application.job.employerId !== employerId) {
      throw new Error('Unauthorized to update this application');
    }

    const updatedApplication = await this.applicationRepository.update(id, {
      status: data.status,
    });

    return updatedApplication;
  }

  /**
   * Withdraw application (seeker only)
   */
  async withdrawApplication(id: string, seekerId: string) {
    // Get application
    const application = await this.applicationRepository.findById(id);
    if (!application) {
      throw new Error('Application not found');
    }

    // Verify application belongs to seeker
    if (application.seekerId !== seekerId) {
      throw new Error('Unauthorized to withdraw this application');
    }

    // Update status to withdrawn
    const updatedApplication = await this.applicationRepository.update(id, {
      status: ApplicationStatus.WITHDRAWN,
    });

    return { success: true, application: updatedApplication };
  }
}