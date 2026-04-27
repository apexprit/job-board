import { PrismaClient } from '@prisma/client';
import { BaseRepository } from './base.repository';

export class CompanyRepository extends BaseRepository<'company'> {
  constructor(prisma: PrismaClient) {
    super(prisma, 'company');
  }

  async findByName(name: string) {
    return this.prisma.company.findMany({
      where: { name: { contains: name } },
    });
  }
}