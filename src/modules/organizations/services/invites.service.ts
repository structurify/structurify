import {
  Injectable,
  Logger,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { Invite, InviteStatus, Organization } from '@prisma/client';
import * as dayjs from 'dayjs';
import { ConfigService } from '@nestjs/config';
import { generate } from 'generate-password';
import { I18nService } from 'nestjs-i18n';

import {
  SendInviteDto,
  ResendInviteDto,
  CancelInviteDto,
  AcceptInviteDto,
  InvitesArgs,
  OrganizationEvents,
  InviteCreatedEvent,
  InviteDeletedEvent,
  InviteExpiredEvent,
  InviteResendedEvent,
  InviteUpdatedEvent,
  ExpireInviteDto,
} from '@contracts/organizations';
import { EmailTemplate } from '@contracts/communication';
import { EventAction } from '@contracts/events';
import { EventsService } from '@modules/events';
import { MailingService } from '@modules/communication';
import { UsersService } from '@modules/users/services';

import { OrganizationsService } from './organizations.service';
import { MembersService } from './members.service';
import { InvitesCache } from '../caches';
import { InvitesRepository } from '../repositories';

@Injectable()
export class InvitesService {
  private readonly logger = new Logger(InvitesService.name);

  constructor(
    private readonly configService: ConfigService,
    private readonly eventsService: EventsService,
    private readonly invitesCache: InvitesCache,
    private readonly invitesRepository: InvitesRepository,
    private readonly i18n: I18nService,
    private readonly mailingService: MailingService,
    private readonly membersService: MembersService,
    private readonly organizationsService: OrganizationsService,
    private readonly usersService: UsersService,
  ) {}

  static entityId(entry: Invite): string {
    return `Organization-${entry.organizationId}/Invite-${entry.id}`;
  }

  async findOneById(id: string): Promise<Invite | null> {
    const cachedData = await this.invitesCache.findOneById(id);
    if (cachedData) {
      return cachedData;
    }

    const invite = await this.invitesRepository.findOneById(id);
    if (!!invite) {
      await this.invitesCache.set(invite);
    }

    return invite;
  }

  async findOneByToken(token: string): Promise<Invite | null> {
    const cachedData = await this.invitesCache.findOneByToken(token);
    if (cachedData) {
      return cachedData;
    }

    const invite = await this.invitesRepository.findOneByToken(token);
    if (!!invite) {
      await this.invitesCache.set(invite);
    }

    return invite;
  }

  async findAll(args: InvitesArgs): Promise<[Invite[], number]> {
    return this.invitesRepository.findAll(args);
  }

  async findAllToExpire(): Promise<Invite[]> {
    return this.invitesRepository.findAllToExpire();
  }

  async sendInvite(dto: SendInviteDto): Promise<Invite> {
    this.logger.debug('sendInvite - dto', {
      dto,
    });

    const [organization, primaryMember] = await Promise.all([
      this.organizationsService.findOneById(dto.organizationId),
      this.membersService.findPrimaryOwner(dto.organizationId),
    ]);
    if (!organization) {
      throw new NotFoundException(dto.organizationId);
    }
    if (!primaryMember) {
      throw new NotFoundException();
    }

    const userOwner = await this.usersService.findOneById(primaryMember.userId);
    if (!userOwner) {
      throw new NotFoundException();
    }

    const token = generate({
      length: 64,
      numbers: true,
      symbols: true,
      uppercase: true,
      lowercase: true,
    });

    const invite = await this.invitesRepository.create({
      token,
      email: dto.email,
      expiresAt: dayjs()
        .add(Number(this.configService.get('INVITE_EXPIRATION')), 'millisecond')
        .toDate(),
      role: dto.role,
      status: InviteStatus.PENDING,
      updatedBy: dto.createdBy,
      createdBy: dto.createdBy,
      organizationId: dto.organizationId,
    });

    await this.invitesCache.set(invite);

    this.logger.debug('sendInvite - invite', {
      invite,
    });

    const context = this.getInviteEmailContext(
      invite,
      organization,
      userOwner.username,
    );

    this.logger.log('sendInvite - context', {
      context,
    });

    await this.mailingService.sendMail({
      to: dto.email,
      subject: context.subject,
      template: EmailTemplate.INVITE_SEND,
      context,
      sendBy: dto.createdBy,
    });

    this.eventsService.emitEvent({
      entity: 'Invite',
      entityId: InvitesService.entityId(invite),
      eventName: OrganizationEvents.INVITE_CREATED,
      event: new InviteCreatedEvent(),
      action: EventAction.CREATE,
      after: invite,
    });

    return invite;
  }

  async resendInvite(dto: ResendInviteDto): Promise<Invite> {
    this.logger.debug('resendInvite - dto', {
      dto,
    });

    const invite = await this.findOneById(dto.id);
    if (!invite) {
      throw new NotFoundException(dto.id);
    }

    const [organization, primaryMember] = await Promise.all([
      this.organizationsService.findOneById(invite.organizationId),
      this.membersService.findPrimaryOwner(invite.organizationId),
    ]);
    if (!organization) {
      throw new NotFoundException(invite.organizationId);
    }
    if (!primaryMember) {
      throw new NotFoundException();
    }

    const userOwner = await this.usersService.findOneById(primaryMember.userId);
    if (!userOwner) {
      throw new NotFoundException();
    }

    const token = generate({
      length: 64,
      numbers: true,
      symbols: true,
      uppercase: true,
      lowercase: true,
    });

    const updatedInvite = await this.invitesRepository.update(dto.id, {
      token,
      expiresAt: dayjs()
        .add(Number(this.configService.get('INVITE_EXPIRATION')), 'millisecond')
        .toDate(),
      status: InviteStatus.PENDING,
      updatedBy: dto.updatedBy,
    });

    await this.invitesCache.set(updatedInvite);
    this.logger.debug('resendInvite - updatedInvite', {
      updatedInvite,
    });

    const context = this.getInviteEmailContext(
      updatedInvite,
      organization,
      userOwner.username,
    );

    this.logger.log('resendInvite - context', {
      context,
    });

    await this.mailingService.sendMail({
      to: invite.email,
      subject: context.subject,
      template: EmailTemplate.INVITE_SEND,
      context,
      sendBy: dto.updatedBy,
    });

    this.eventsService.emitEvent({
      entity: 'Invite',
      entityId: InvitesService.entityId(invite),
      eventName: OrganizationEvents.INVITE_RESENDED,
      event: new InviteResendedEvent(),
      action: EventAction.UPDATE,
      before: invite,
      after: updatedInvite,
    });
    this.eventsService.emitEvent({
      entity: 'Invite',
      entityId: InvitesService.entityId(invite),
      eventName: OrganizationEvents.INVITE_UPDATED,
      event: new InviteUpdatedEvent(),
      action: EventAction.UPDATE,
      before: invite,
      after: updatedInvite,
    });

    return updatedInvite;
  }

  async cancelInvite(dto: CancelInviteDto): Promise<Invite> {
    this.logger.debug('cancelInvite - dto', {
      dto,
    });

    const invite = await this.findOneById(dto.id);
    if (!invite) {
      throw new NotFoundException(dto.id);
    }

    const updatedInvite = await this.invitesRepository.update(dto.id, {
      status: InviteStatus.CANCELLED,
      deletedBy: dto.deletedBy,
      deletedAt: new Date(),
    });

    await this.invitesCache.delete(dto.id);

    this.logger.debug('cancelInvite - updatedInvite', {
      updatedInvite,
    });

    this.eventsService.emitEvent({
      entity: 'Invite',
      entityId: InvitesService.entityId(invite),
      eventName: OrganizationEvents.INVITE_DELETED,
      event: new InviteDeletedEvent(),
      action: EventAction.DELETE,
      before: invite,
      after: updatedInvite,
    });

    return updatedInvite;
  }

  async acceptInvite(dto: AcceptInviteDto): Promise<Invite> {
    this.logger.debug('acceptInvite - dto', {
      dto,
    });

    const invite = await this.findOneByToken(dto.token);
    if (!invite) {
      throw new NotFoundException(dto.token);
    }

    if (invite.status === InviteStatus.ACCEPTED) {
      throw new BadRequestException(
        this.i18n.translate(
          'organizations.invitations.errors.already-accepted',
        ),
      );
    }

    if (invite.status === InviteStatus.DECLINED) {
      throw new BadRequestException(
        this.i18n.translate('organizations.invitations.errors.declined'),
      );
    }

    if (
      invite.status === InviteStatus.EXPIRED ||
      dayjs().isAfter(invite.expiresAt)
    ) {
      throw new BadRequestException(
        this.i18n.translate('organizations.invitations.errors.expired'),
      );
    }

    if (invite.status === InviteStatus.CANCELLED) {
      throw new BadRequestException(
        this.i18n.translate('organizations.invitations.errors.cancelled'),
      );
    }

    const updatedInvite = await this.invitesRepository.update(invite.id, {
      status: InviteStatus.ACCEPTED,
      updatedBy: dto.updatedBy,
    });

    await this.invitesCache.set(updatedInvite);

    this.logger.debug('acceptInvite - updatedInvite', {
      updatedInvite,
    });

    this.eventsService.emitEvent({
      entity: 'Invite',
      entityId: InvitesService.entityId(invite),
      eventName: OrganizationEvents.INVITE_UPDATED,
      event: new InviteUpdatedEvent(),
      action: EventAction.UPDATE,
      before: invite,
      after: updatedInvite,
    });

    return updatedInvite;
  }

  async expireInvite(dto: ExpireInviteDto): Promise<Invite> {
    this.logger.debug('expireInvite - dto', {
      dto,
    });

    const invite = await this.findOneById(dto.id);
    if (!invite) {
      throw new NotFoundException(dto.id);
    }

    const updatedInvite = await this.invitesRepository.update(dto.id, {
      status: InviteStatus.EXPIRED,
      updatedBy: dto.expiredBy,
    });

    await this.invitesCache.set(updatedInvite);

    this.logger.debug('expireInvite - updatedInvite', {
      updatedInvite,
    });

    this.eventsService.emitEvent({
      entity: 'Invite',
      entityId: InvitesService.entityId(invite),
      eventName: OrganizationEvents.INVITE_UPDATED,
      event: new InviteUpdatedEvent(),
      action: EventAction.UPDATE,
      before: invite,
      after: updatedInvite,
    });

    this.eventsService.emitEvent({
      entity: 'Invite',
      entityId: InvitesService.entityId(invite),
      eventName: OrganizationEvents.INVITE_EXPIRED,
      event: new InviteExpiredEvent(),
      action: EventAction.UPDATE,
      before: invite,
      after: updatedInvite,
    });

    return updatedInvite;
  }

  private getInviteEmailContext(
    invite: Invite,
    organization: Organization,
    username: string,
  ): Record<string, string> {
    const url = `${this.configService.get('WEB_URL')}/dashboard/join?token=${
      invite.token
    }&slug=${organization.slug}`;

    const context = {
      url,
      subject: this.i18n.translate('organizations.emails.invite.send.subject', {
        args: {
          username,
          organizationName: organization.name,
        },
      }),
      heading: this.i18n.translate('organizations.emails.invite.send.heading', {
        args: {
          username,
          organizationName: organization.name,
        },
      }),
      joinText: this.i18n.translate(
        'organizations.emails.invite.send.join-text',
      ),
      subheading: this.i18n.translate(
        'organizations.emails.invite.send.subheading',
      ),
      description: this.i18n.translate(
        'organizations.emails.invite.send.description',
      ),
    };

    return context;
  }
}
