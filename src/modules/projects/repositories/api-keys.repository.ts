import { Injectable, Logger } from '@nestjs/common';
import { ApiKey, Prisma } from '@prisma/client';

import { PrismaService } from '@providers/db/prisma';
import { ApiKeysArgs } from '@contracts/projects';

@Injectable()
export class ApiKeysRepository {
  private readonly logger = new Logger(ApiKeysRepository.name);

  constructor(private readonly prisma: PrismaService) {}

  async findOneById(id: string): Promise<ApiKey | null> {
    return this.prisma.apiKey.findUnique({
      where: {
        id,
        deletedAt: null,
      },
    });
  }

  async findAll({
    projectId,
    ...args
  }: ApiKeysArgs): Promise<[ApiKey[], number]> {
    return Promise.all([
      this.prisma.apiKey.findMany({
        ...args,
        where: {
          projectId,
          deletedAt: null,
        },
      }),
      this.prisma.apiKey.count({
        ...args,
        where: {
          projectId,
          deletedAt: null,
        },
      }),
    ]);
  }

  async create(data: Prisma.ApiKeyCreateArgs['data']): Promise<ApiKey> {
    return this.prisma.apiKey.create({
      data,
    });
  }

  async update(
    id: string,
    data: Prisma.ApiKeyUpdateArgs['data'],
  ): Promise<ApiKey> {
    return this.prisma.apiKey.update({
      where: {
        id,
        deletedAt: null,
      },
      data,
    });
  }

  async delete(id: string, deletedBy: Record<string, string>): Promise<ApiKey> {
    return this.prisma.apiKey.update({
      where: {
        id,
        deletedAt: null,
      },
      data: {
        deletedBy,
        deletedAt: new Date(),
      },
    });
  }
}
