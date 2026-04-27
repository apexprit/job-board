import { PrismaClient } from '@prisma/client';
import { UserRole } from '@prisma/client';
import { BaseRepository } from './base.repository';

export class UserRepository extends BaseRepository<'user'> {
  constructor(prisma: PrismaClient) {
    super(prisma, 'user');
  }

  async findByEmail(email: string) {
    return this.prisma.user.findUnique({
      where: { email },
    });
  }

  async findByRole(role: UserRole) {
    return this.prisma.user.findMany({
      where: { role },
    });
  }
}