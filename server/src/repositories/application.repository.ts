import { PrismaClient } from '@prisma/client';
import { BaseRepository } from './base.repository';

export class ApplicationRepository extends BaseRepository<'application'> {
  constructor(prisma: PrismaClient) {
    super(prisma, 'application');
  }

  async findBySeeker(seekerId: string) {
    return this.prisma.application.findMany({
      where: { seekerId },
    });
  }

  async findByJob(jobId: string) {
    return this.prisma.application.findMany({
      where: { jobId },
    });
  }
}