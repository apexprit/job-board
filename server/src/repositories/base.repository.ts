import { PrismaClient } from '@prisma/client';

export abstract class BaseRepository<T extends keyof PrismaClient> {
  protected prisma: PrismaClient;
  protected model: T;

  constructor(prisma: PrismaClient, model: T) {
    this.prisma = prisma;
    this.model = model;
  }

  protected getModel() {
    return this.prisma[this.model] as any;
  }

  async findById(id: string): Promise<any | null> {
    return this.getModel().findUnique({
      where: { id },
    });
  }

  async findMany(params?: any): Promise<any[]> {
    return this.getModel().findMany(params);
  }

  async create(data: any): Promise<any> {
    return this.getModel().create({
      data,
    });
  }

  async update(id: string, data: any): Promise<any> {
    return this.getModel().update({
      where: { id },
      data,
    });
  }

  async delete(id: string): Promise<any> {
    return this.getModel().delete({
      where: { id },
    });
  }

  async count(params?: any): Promise<number> {
    return this.getModel().count(params);
  }
}