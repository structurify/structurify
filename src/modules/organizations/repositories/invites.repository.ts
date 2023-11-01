import { Injectable, Logger } from '@nestjs/common';
import { Invite, InviteStatus, Prisma } from '@prisma/client';
import * as dayjs from 'dayjs';

import { InvitesArgs } from '@contracts/organizations';

import { PrismaService } from '@providers/db/prisma';

@Injectable()
export class InvitesRepository {
  private readonly logger = new Logger(InvitesRepository.name);

  constructor(private readonly prisma: PrismaService) {}

  async findOneById(id: string): Promise<Invite | null> {
    return this.prisma.invite.findUnique({
      where: {
        id,
        deletedAt: null,
      },
    });
  }

  async findOneByToken(token: string): Promise<Invite | null> {
    return this.prisma.invite.findUnique({
      where: {
        token,
        deletedAt: null,
      },
    });
  }

  async findAll({
    organizationId,
    ...args
  }: InvitesArgs): Promise<[Invite[], number]> {
    return Promise.all([
      this.prisma.invite.findMany({
        ...args,
        where: {
          organizationId,
          deletedAt: null,
        },
      }),
      this.prisma.invite.count({
        ...args,
        where: {
          organizationId,
          deletedAt: null,
        },
      }),
    ]);
  }

  async findAllToExpire(): Promise<Invite[]> {
    return this.prisma.invite.findMany({
      where: {
        expiresAt: {
          lte: dayjs().toDate(),
        },
        status: InviteStatus.PENDING,
        deletedAt: null,
      },
    });
  }

  async create(data: Prisma.InviteCreateArgs['data']): Promise<Invite> {
    return this.prisma.invite.create({
      data,
    });
  }

  async update(
    id: string,
    data: Prisma.InviteUpdateArgs['data'],
  ): Promise<Invite> {
    return this.prisma.invite.update({
      where: {
        id,
        deletedAt: null,
      },
      data,
    });
  }
}
