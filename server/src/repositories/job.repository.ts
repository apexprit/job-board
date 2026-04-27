import { PrismaClient } from '@prisma/client';
import { JobStatus } from '@prisma/client';
import { BaseRepository } from './base.repository';

export class JobRepository extends BaseRepository<'job'> {
  constructor(prisma: PrismaClient) {
    super(prisma, 'job');
  }

  async findByEmployer(employerId: string) {
    return this.prisma.job.findMany({
      where: { employerId },
    });
  }

  async findByCompany(companyId: string) {
    return this.prisma.job.findMany({
      where: { companyId },
    });
  }

  async findApproved(params?: any) {
    return this.prisma.job.findMany({
      where: { status: JobStatus.APPROVED },
      ...params,
    });
  }
}