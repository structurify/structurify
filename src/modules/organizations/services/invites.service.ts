import {
  Injectable,
  Inject,
  Logger,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { Invite, InviteStatus, Organization } from '@prisma/client';
import * as dayjs from 'dayjs';
import { ConfigService } from '@nestjs/config';
import { generate } from 'generate-password';
import { I18nService } from 'nestjs-i18n';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';

import {
  SendInviteDto,
  ResendInviteDto,
  CancelInviteDto,
  AcceptInviteDto,
  InvitationsArgs,
  OrganizationEvents,
  InviteCreatedEvent,
  InviteDeletedEvent,
  InviteExpiredEvent,
  InviteResendedEvent,
  InviteUpdatedEvent,
  ExpireInviteDto,
} from '@contracts/organizations';
import { EventAction } from '@contracts/events';
import { EventsService } from '@modules/events/services';
import { MailingRepository } from '@modules/communication/repositories';
import { UsersService } from '@modules/users/services';
import { PrismaService } from '@providers/db/prisma/services/prisma.service';

import { OrganizationsService } from './organizations.service';

@Injectable()
export class InvitesService {
  private readonly logger = new Logger(InvitesService.name);

  constructor(
    @Inject(CACHE_MANAGER) private cacheService: Cache,
    private readonly prisma: PrismaService,
    private readonly eventsService: EventsService,
    private readonly mailingRepository: MailingRepository,
    private readonly configService: ConfigService,
    private readonly organizationsService: OrganizationsService,
    private readonly usersService: UsersService,
    private readonly i18n: I18nService,
  ) {}

  async findOneById(id: string): Promise<Invite | null> {
    const cachedData = await this.cacheService.get<Invite>(`Invite-${id}/ID`);
    if (cachedData) {
      this.logger.debug(`Invite-${id}/ID found in cache`);
      return cachedData;
    }

    const invite = await this.prisma.invite.findUnique({
      where: {
        id,
        deletedAt: null,
      },
    });

    if (!!invite) {
      await this.cacheService.set(`Invite-${id}/ID`, invite);
      this.logger.debug(`Invite-${id}/ID stored in cache`);
    }

    return invite;
  }

  async findOneByToken(token: string): Promise<Invite | null> {
    const cachedData = await this.cacheService.get<Invite>(
      `Invite-${token}/Token`,
    );
    if (cachedData) {
      this.logger.debug(`Invite-${token}/Token found in cache`);
      return cachedData;
    }

    const invite = await this.prisma.invite.findUnique({
      where: {
        token,
        deletedAt: null,
      },
    });

    if (!!invite) {
      await this.cacheService.set(`Invite-${token}/Token`, invite);
      this.logger.debug(`Invite-${token}/Token stored in cache`);
    }

    return invite;
  }

  async findAll({
    organizationId,
    ...args
  }: InvitationsArgs): Promise<[Invite[], number]> {
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

  async sendInvite(dto: SendInviteDto): Promise<Invite> {
    this.logger.debug('sendInvite - dto', {
      dto,
    });

    const organization = await this.organizationsService.findOneById(
      dto.organizationId,
    );
    if (!organization) {
      throw new NotFoundException(dto.organizationId);
    }

    const token = generate({
      length: 64,
      numbers: true,
      symbols: true,
      uppercase: true,
      lowercase: true,
    });

    const invite = await this.prisma.invite.create({
      data: {
        token,
        email: dto.email,
        expiresAt: dayjs()
          .add(
            Number(this.configService.get('INVITE_EXPIRATION')),
            'millisecond',
          )
          .toDate(),
        role: dto.role,
        status: InviteStatus.PENDING,
        updatedBy: dto.createdBy,
        createdBy: dto.createdBy,
        organizationId: dto.organizationId,
      },
    });

    await this.cacheService.set(`Invite-${invite.id}/ID`, invite);
    this.logger.debug(`Invite-${invite.id}/ID stored in cache`);

    this.logger.debug('sendInvite - invite', {
      invite,
    });

    const context = this.getInviteEmailContext(
      invite,
      organization,
      'Abdizriel',
    );

    this.logger.log('sendInvite - context', {
      context,
    });

    await this.mailingRepository.sendMail({
      to: dto.email,
      subject: context.subject,
      template: 'emails/organizations/invite-send',
      context,
    });

    this.eventsService.emitEvent({
      entity: 'Invitation',
      entityId: `Organization-${invite.organizationId}/Invitation-${invite.id}`,
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

    const organization = await this.organizationsService.findOneById(
      invite.organizationId,
    );
    if (!organization) {
      throw new NotFoundException(invite.organizationId);
    }

    const token = generate({
      length: 64,
      numbers: true,
      symbols: true,
      uppercase: true,
      lowercase: true,
    });

    const updatedInvitation = await this.prisma.invite.update({
      where: {
        id: dto.id,
        deletedAt: null,
      },
      data: {
        token,
        expiresAt: dayjs()
          .add(
            Number(this.configService.get('INVITE_EXPIRATION')),
            'millisecond',
          )
          .toDate(),
        status: InviteStatus.PENDING,
        updatedBy: dto.updatedBy,
      },
    });

    await this.cacheService.set(
      `Invite-${updatedInvitation.id}/ID`,
      updatedInvitation,
    );
    this.logger.debug(`Invite-${updatedInvitation.id}/ID updated in cache`);

    this.logger.debug('resendInvite - updatedInvitation', {
      updatedInvitation,
    });

    const context = this.getInviteEmailContext(
      updatedInvitation,
      organization,
      'Abdizriel',
    );

    this.logger.log('resendInvite - context', {
      context,
    });

    await this.mailingRepository.sendMail({
      to: invite.email,
      subject: context.subject,
      template: 'emails/organizations/invite-send',
      context,
    });

    this.eventsService.emitEvent({
      entity: 'Invitation',
      entityId: `Organization-${invite.organizationId}/Invitation-${invite.id}`,
      eventName: OrganizationEvents.INVITE_RESENDED,
      event: new InviteResendedEvent(),
      action: EventAction.UPDATE,
      before: invite,
      after: updatedInvitation,
    });
    this.eventsService.emitEvent({
      entity: 'Invitation',
      entityId: `Organization-${invite.organizationId}/Invitation-${invite.id}`,
      eventName: OrganizationEvents.INVITE_UPDATED,
      event: new InviteUpdatedEvent(),
      action: EventAction.UPDATE,
      before: invite,
      after: updatedInvitation,
    });

    return updatedInvitation;
  }

  async cancelInvite(dto: CancelInviteDto): Promise<Invite> {
    this.logger.debug('cancelInvite - dto', {
      dto,
    });

    const invitation = await this.findOneById(dto.id);
    if (!invitation) {
      throw new NotFoundException(dto.id);
    }

    const updatedInvitation = await this.prisma.invite.update({
      where: {
        id: dto.id,
        deletedAt: null,
      },
      data: {
        status: InviteStatus.CANCELLED,
        deletedBy: dto.deletedBy,
        deletedAt: new Date(),
      },
    });

    await this.cacheService.del(`Invite-${updatedInvitation.id}/ID`);
    this.logger.debug(`Invite-${updatedInvitation.id}/ID deleted from cache`);

    this.logger.debug('cancelInvite - updatedInvitation', {
      updatedInvitation,
    });

    this.eventsService.emitEvent({
      entity: 'Invitation',
      entityId: `Organization-${invitation.organizationId}/Invitation-${invitation.id}`,
      eventName: OrganizationEvents.INVITE_DELETED,
      event: new InviteDeletedEvent(),
      action: EventAction.DELETE,
      before: invitation,
      after: updatedInvitation,
    });

    return updatedInvitation;
  }

  async acceptInvite(dto: AcceptInviteDto): Promise<Invite> {
    this.logger.debug('acceptInvite - dto', {
      dto,
    });

    const invitation = await this.findOneByToken(dto.token);
    if (!invitation) {
      throw new NotFoundException(dto.token);
    }

    if (invitation.status === InviteStatus.ACCEPTED) {
      throw new BadRequestException(
        this.i18n.translate(
          'organizations.invitations.errors.already-accepted',
        ),
      );
    }

    if (invitation.status === InviteStatus.DECLINED) {
      throw new BadRequestException(
        this.i18n.translate('organizations.invitations.errors.declined'),
      );
    }

    if (
      invitation.status === InviteStatus.EXPIRED ||
      dayjs().isAfter(invitation.expiresAt)
    ) {
      throw new BadRequestException(
        this.i18n.translate('organizations.invitations.errors.expired'),
      );
    }

    if (invitation.status === InviteStatus.CANCELLED) {
      throw new BadRequestException(
        this.i18n.translate('organizations.invitations.errors.cancelled'),
      );
    }

    const updatedInvitation = await this.prisma.invite.update({
      where: {
        token: dto.token,
        deletedAt: null,
      },
      data: {
        status: InviteStatus.ACCEPTED,
        updatedBy: dto.updatedBy,
      },
    });

    await this.cacheService.set(
      `Invite-${updatedInvitation.id}/ID`,
      updatedInvitation,
    );
    this.logger.debug(`Invite-${updatedInvitation.id}/ID updated in cache`);

    this.logger.debug('acceptInvite - updatedInvitation', {
      updatedInvitation,
    });

    this.eventsService.emitEvent({
      entity: 'Invitation',
      entityId: `Organization-${invitation.organizationId}/Invitation-${invitation.id}`,
      eventName: OrganizationEvents.INVITE_UPDATED,
      event: new InviteUpdatedEvent(),
      action: EventAction.UPDATE,
      before: invitation,
      after: updatedInvitation,
    });

    return updatedInvitation;
  }

  async expireInvite(dto: ExpireInviteDto): Promise<Invite> {
    this.logger.debug('expireInvite - dto', {
      dto,
    });

    const invitation = await this.findOneById(dto.id);
    if (!invitation) {
      throw new NotFoundException(dto.id);
    }

    const updatedInvitation = await this.prisma.invite.update({
      where: {
        id: dto.id,
        deletedAt: null,
      },
      data: {
        status: InviteStatus.EXPIRED,
        updatedBy: dto.expiredBy,
      },
    });

    await this.cacheService.set(
      `Invite-${updatedInvitation.id}/ID`,
      updatedInvitation,
    );
    this.logger.debug(`Invite-${updatedInvitation.id}/ID updated in cache`);

    this.logger.debug('expireInvite - updatedInvitation', {
      updatedInvitation,
    });

    this.eventsService.emitEvent({
      entity: 'Invitation',
      entityId: `Organization-${invitation.organizationId}/Invitation-${invitation.id}`,
      eventName: OrganizationEvents.INVITE_UPDATED,
      event: new InviteUpdatedEvent(),
      action: EventAction.UPDATE,
      before: invitation,
      after: updatedInvitation,
    });

    this.eventsService.emitEvent({
      entity: 'Invitation',
      entityId: `Organization-${invitation.organizationId}/Invitation-${invitation.id}`,
      eventName: OrganizationEvents.INVITE_EXPIRED,
      event: new InviteExpiredEvent(),
      action: EventAction.UPDATE,
      before: invitation,
      after: updatedInvitation,
    });

    return updatedInvitation;
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
