import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { Member } from '@prisma/client';

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
import { EventAction } from '@contracts/events';
import { EventsService } from '@modules/events';

import { MembersCache } from '../caches';
import { MembersRepository } from '../repositories';

@Injectable()
export class MembersService {
  private readonly logger = new Logger(MembersService.name);

  constructor(
    private readonly eventsService: EventsService,
    private readonly membersCache: MembersCache,
    private readonly membersRepository: MembersRepository,
  ) {}

  async findOne(
    organizationId: string,
    userId: string,
  ): Promise<Member | null> {
    const cachedData = await this.membersCache.findOneById(
      organizationId,
      userId,
    );
    if (cachedData) {
      return cachedData;
    }

    const member = await this.membersRepository.findOne(organizationId, userId);
    if (!!member) {
      await this.membersCache.set(member);
    }

    return member;
  }

  async findAll(args: MembersArgs): Promise<[Member[], number]> {
    return this.membersRepository.findAll(args);
  }

  async findPrimaryOwner(organizationId: string): Promise<Member | null> {
    const cachedData = await this.membersCache.findPrimaryOwner(organizationId);
    if (cachedData) {
      return cachedData;
    }

    const member =
      await this.membersRepository.findPrimaryOwner(organizationId);
    if (!!member) {
      await this.membersCache.set(member);
    }

    return member;
  }

  async create(input: CreateMemberDto): Promise<Member> {
    const member = await this.membersRepository.create({
      ...input,
      updatedBy: input.createdBy,
    });

    await this.membersCache.set(member);

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

    const updatedMember = await this.membersRepository.update(
      userId,
      organizationId,
      rest,
    );

    await this.membersCache.set(updatedMember);

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

    const updatedMember = await this.membersRepository.update(
      userId,
      organizationId,
      {
        deletedBy,
        deletedAt: new Date(),
      },
    );

    await this.membersCache.delete(
      updatedMember.organizationId,
      updatedMember.userId,
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
