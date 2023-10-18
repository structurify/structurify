import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { Organization } from '@prisma/client';
import { generate } from 'generate-password';

import { PrismaService } from '@providers/db/prisma/services/prisma.service';
import { EventsService } from '@modules/events/services';
import {
  CreateOrganizationDto,
  DeleteOrganizationDto,
  UpdateOrganizationDto,
  OrganizationsArgs,
  OrganizationsByUserArgs,
  OrganizationEvents,
  OrganizationCreatedEvent,
  OrganizationDeletedEvent,
  OrganizationUpdatedEvent,
} from '@contracts/organizations';
import { EventAction } from '@app/contracts/events';

@Injectable()
export class OrganizationsService {
  private readonly logger = new Logger(OrganizationsService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly eventsService: EventsService,
  ) {}

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

  async create(input: CreateOrganizationDto): Promise<Organization> {
    const slug = generate({
      length: 20,
      numbers: false,
      symbols: false,
      uppercase: false,
      lowercase: true,
    });

    const organization = await this.prisma.organization.create({
      data: {
        ...input,
        slug,
        updatedBy: input.createdBy,
      },
    });

    this.eventsService.emitEvent({
      entity: 'Organization',
      entityId: `Organization-${organization.id}`,
      eventName: OrganizationEvents.ORGANIZATION_CREATED,
      event: new OrganizationCreatedEvent(),
      action: EventAction.CREATE,
      after: organization,
    });

    return organization;
  }

  async update(input: UpdateOrganizationDto): Promise<Organization> {
    const { id, ...rest } = input;

    const organization = await this.findOneById(id);
    if (!organization) {
      throw new NotFoundException(id);
    }

    const updatedOrganiation = await this.prisma.organization.update({
      where: {
        id,
        deletedAt: null,
      },
      data: {
        ...rest,
      },
    });

    this.eventsService.emitEvent({
      entity: 'Organization',
      entityId: `Organization-${organization.id}`,
      eventName: OrganizationEvents.ORGANIZATION_UPDATED,
      event: new OrganizationUpdatedEvent(),
      action: EventAction.UPDATE,
      before: organization,
      after: updatedOrganiation,
    });

    return updatedOrganiation;
  }

  async delete(input: DeleteOrganizationDto): Promise<Organization> {
    const { id, deletedBy } = input;

    const organization = await this.findOneById(id);
    if (!organization) {
      throw new NotFoundException(id);
    }

    const updatedOrganiation = await this.prisma.organization.update({
      where: {
        id,
        deletedAt: null,
      },
      data: {
        deletedBy,
        deletedAt: new Date(),
      },
    });

    this.eventsService.emitEvent({
      entity: 'Organization',
      entityId: `Organization-${organization.id}`,
      eventName: OrganizationEvents.ORGANIZATION_DELETED,
      event: new OrganizationDeletedEvent(),
      action: EventAction.DELETE,
      after: organization,
    });

    return updatedOrganiation;
  }
}
