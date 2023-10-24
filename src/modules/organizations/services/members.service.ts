import { Injectable, Inject, Logger, NotFoundException } from '@nestjs/common';
import { Member } from '@prisma/client';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';

import { PrismaService } from '@providers/db/prisma/services/prisma.service';
import { EventsService } from '@modules/events/services';
import {
  CreateMemberDto,
  DeleteMemberDto,
  UpdateMemberDto,
  MembersArgs,
  OrganizationEvents,
  MemberCreatedEvent,
  MemberDeletedEvent,
  MemberUpdatedEvent,
} from '@contracts/organizations';
import { EventAction } from '@app/contracts/events';

@Injectable()
export class MembersService {
  private readonly logger = new Logger(MembersService.name);

  constructor(
    @Inject(CACHE_MANAGER) private cacheService: Cache,
    private readonly prisma: PrismaService,
    private readonly eventsService: EventsService,
  ) {}

  async findOne(
    organizationId: string,
    userId: string,
  ): Promise<Member | null> {
    const cachedData = await this.cacheService.get<Member>(
      `Organization-${organizationId}/User-${userId}`,
    );
    if (cachedData) {
      this.logger.debug(
        `Organization-${organizationId}/User-${userId} found in cache`,
      );
      return cachedData;
    }

    const member = await this.prisma.member.findUnique({
      where: {
        userId_organizationId: {
          userId,
          organizationId,
        },
        deletedAt: null,
      },
    });

    if (!!member) {
      await this.cacheService.set(
        `Organization-${organizationId}/User-${userId}`,
        member,
      );
      this.logger.debug(
        `Organization-${organizationId}/User-${userId} stored in cache`,
      );
    }

    return member;
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

  async create(input: CreateMemberDto): Promise<Member> {
    const member = await this.prisma.member.create({
      data: {
        ...input,
        updatedBy: input.createdBy,
      },
    });

    await this.cacheService.set(
      `Organization-${member.organizationId}/User-${member.userId}`,
      member,
    );
    this.logger.debug(
      `Organization-${member.organizationId}/User-${member.userId} stored in cache`,
    );

    this.eventsService.emitEvent({
      entity: 'Member',
      entityId: `Organization-${member.organizationId}/User-${member.userId}`,
      eventName: OrganizationEvents.MEMBER_CREATED,
      event: new MemberCreatedEvent(),
      action: EventAction.CREATE,
      after: member,
    });

    return member;
  }

  async update(input: UpdateMemberDto): Promise<Member> {
    const { userId, organizationId, ...rest } = input;

    const member = await this.findOne(organizationId, userId);
    if (!member) {
      throw new NotFoundException(`${organizationId}/${userId}`);
    }

    const updatedMember = await this.prisma.member.update({
      where: {
        userId_organizationId: {
          userId,
          organizationId,
        },
        deletedAt: null,
      },
      data: {
        ...rest,
      },
    });

    await this.cacheService.set(
      `Organization-${updatedMember.organizationId}/User-${updatedMember.userId}`,
      updatedMember,
    );
    this.logger.debug(
      `Organization-${updatedMember.organizationId}/User-${updatedMember.userId} updated in cache`,
    );

    this.eventsService.emitEvent({
      entity: 'Member',
      entityId: `Organization-${member.organizationId}/User-${member.userId}`,
      eventName: OrganizationEvents.MEMBER_UPDATED,
      event: new MemberUpdatedEvent(),
      action: EventAction.UPDATE,
      before: member,
      after: updatedMember,
    });

    return updatedMember;
  }

  async delete(input: DeleteMemberDto): Promise<Member> {
    const { organizationId, userId, deletedBy } = input;

    const member = await this.findOne(organizationId, userId);
    if (!member) {
      throw new NotFoundException(`${organizationId}/${userId}`);
    }

    const updatedMember = await this.prisma.member.update({
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

    await this.cacheService.del(
      `Organization-${updatedMember.organizationId}/User-${updatedMember.userId}`,
    );
    this.logger.debug(
      `Organization-${updatedMember.organizationId}/User-${updatedMember.userId} deleted from cache`,
    );

    this.eventsService.emitEvent({
      entity: 'Member',
      entityId: `Organization-${member.organizationId}/User-${member.userId}`,
      eventName: OrganizationEvents.MEMBER_DELETED,
      event: new MemberDeletedEvent(),
      action: EventAction.DELETE,
      before: member,
      after: updatedMember,
    });

    return updatedMember;
  }
}
