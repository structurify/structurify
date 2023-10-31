import { Injectable, Logger } from '@nestjs/common';
import { Organization, Prisma } from '@prisma/client';

import { PrismaService } from '@providers/db/prisma/services/prisma.service';
import {
  OrganizationsArgs,
  OrganizationsByUserArgs,
} from '@contracts/organizations';

@Injectable()
export class OrganizationsRepository {
  private readonly logger = new Logger(OrganizationsRepository.name);

  constructor(private readonly prisma: PrismaService) {}

  async findOneById(id: string): Promise<Organization | null> {
    return this.prisma.organization.findUnique({
      where: {
        id,
        deletedAt: null,
      },
    });
  }

  async findAll(args: OrganizationsArgs): Promise<[Organization[], number]> {
    return Promise.all([
      this.prisma.organization.findMany({
        ...args,
        where: {
          deletedAt: null,
        },
      }),
      this.prisma.organization.count({
        ...args,
        where: {
          deletedAt: null,
        },
      }),
    ]);
  }

  async findAllByUserId({
    userId,
    ...args
  }: OrganizationsByUserArgs): Promise<[Organization[], number]> {
    return Promise.all([
      this.prisma.organization.findMany({
        ...args,
        where: {
          deletedAt: null,
          members: {
            some: {
              userId,
            },
          },
        },
      }),
      this.prisma.organization.count({
        ...args,
        where: {
          deletedAt: null,
          members: {
            every: {
              userId,
            },
          },
        },
      }),
    ]);
  }

  async create(
    data: Prisma.OrganizationCreateArgs['data'],
  ): Promise<Organization> {
    return this.prisma.organization.create({
      data,
    });
  }

  async update(
    id: string,
    data: Prisma.OrganizationUpdateArgs['data'],
  ): Promise<Organization> {
    return this.prisma.organization.update({
      where: {
        id,
        deletedAt: null,
      },
      data,
    });
  }

  async delete(
    id: string,
    deletedBy: Record<string, string>,
  ): Promise<Organization> {
    return this.prisma.organization.update({
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
