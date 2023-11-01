import { Injectable, Logger } from '@nestjs/common';
import { Member, Prisma } from '@prisma/client';

import { PrismaService } from '@providers/db/prisma';
import { MembersArgs } from '@contracts/organizations';

@Injectable()
export class MembersRepository {
  private readonly logger = new Logger(MembersRepository.name);

  constructor(private readonly prisma: PrismaService) {}

  async findOne(
    organizationId: string,
    userId: string,
  ): Promise<Member | null> {
    return this.prisma.member.findUnique({
      where: {
        userId_organizationId: {
          userId,
          organizationId,
        },
        deletedAt: null,
      },
    });
  }

  async findAll({
    organizationId,
    ...args
  }: MembersArgs): Promise<[Member[], number]> {
    return Promise.all([
      this.prisma.member.findMany({
        ...args,
        where: {
          organizationId,
          deletedAt: null,
        },
      }),
      this.prisma.member.count({
        ...args,
        where: {
          organizationId,
          deletedAt: null,
        },
      }),
    ]);
  }

  async findPrimaryOwner(organizationId: string): Promise<Member | null> {
    return this.prisma.member.findFirst({
      where: {
        organizationId,
        isOwner: true,
        deletedAt: null,
      },
    });
  }

  async create(data: Prisma.MemberCreateArgs['data']): Promise<Member> {
    return this.prisma.member.create({
      data,
    });
  }

  async update(
    userId: string,
    organizationId: string,
    data: Prisma.MemberUpdateArgs['data'],
  ): Promise<Member> {
    return this.prisma.member.update({
      where: {
        userId_organizationId: {
          userId,
          organizationId,
        },
        deletedAt: null,
      },
      data,
    });
  }

  async delete(
    userId: string,
    organizationId: string,
    deletedBy: Record<string, string>,
  ): Promise<Member> {
    return this.prisma.member.update({
      where: {
        userId_organizationId: {
          userId,
          organizationId,
        },
        deletedAt: null,
      },
      data: {
        deletedBy,
        deletedAt: new Date(),
      },
    });
  }
}
