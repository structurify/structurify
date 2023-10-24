import {
  Injectable,
  Logger,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { Invite, InviteStatus } from '@prisma/client';
import * as dayjs from 'dayjs';
import { ConfigService } from '@nestjs/config';
import { generate } from 'generate-password';
import { I18nService } from 'nestjs-i18n';

import { PrismaService } from '@providers/db/prisma/services/prisma.service';
import { EventsService } from '@modules/events/services';
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
import { EventAction } from '@app/contracts/events';
import { MailingRepository } from '@modules/communication/repositories';

@Injectable()
export class InvitationsService {
  private readonly logger = new Logger(InvitationsService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly eventsService: EventsService,
    private readonly mailingRepository: MailingRepository,
    private readonly configService: ConfigService,
    private readonly i18n: I18nService,
  ) {}

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

    const token = generate({
      length: 64,
      numbers: true,
      symbols: true,
      uppercase: true,
      lowercase: true,
    });

    const invitation = await this.prisma.invite.create({
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

    this.logger.debug('sendInvite - invitation', {
      invitation,
    });

    const context = {
      subject: this.i18n.translate('organizations.emails.invite.send.subject'),
      body: this.i18n.translate('organizations.emails.invite.send.body', {
        args: {
          token,
        },
      }),
    };

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
      entityId: `Organization-${invitation.organizationId}/Invitation-${invitation.id}`,
      eventName: OrganizationEvents.INVITE_CREATED,
      event: new InviteCreatedEvent(),
      action: EventAction.CREATE,
      after: invitation,
    });

    return invitation;
  }

  async resendInvite(dto: ResendInviteDto): Promise<Invite> {
    this.logger.debug('resendInvite - dto', {
      dto,
    });

    const invitation = await this.findOneById(dto.id);
    if (!invitation) {
      throw new NotFoundException(dto.id);
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

    this.logger.debug('resendInvite - updatedInvitation', {
      updatedInvitation,
    });

    const context = {
      subject: this.i18n.translate(
        'organizations.emails.invite.resend.subject',
      ),
      body: this.i18n.translate('organizations.emails.invite.resend.body', {
        args: {
          token,
        },
      }),
    };

    this.logger.log('resendInvite - context', {
      context,
    });

    await this.mailingRepository.sendMail({
      to: invitation.email,
      subject: context.subject,
      template: 'emails/organizations/invite-resend',
      context,
    });

    this.eventsService.emitEvent({
      entity: 'Invitation',
      entityId: `Organization-${invitation.organizationId}/Invitation-${invitation.id}`,
      eventName: OrganizationEvents.INVITE_RESENDED,
      event: new InviteResendedEvent(),
      action: EventAction.UPDATE,
      before: invitation,
      after: updatedInvitation,
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
}
