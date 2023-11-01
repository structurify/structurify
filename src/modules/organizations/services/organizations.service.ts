import { Injectable, Logger, NotFoundException, Inject } from '@nestjs/common';
import { Organization } from '@prisma/client';
import { generate } from 'generate-password';

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
import { EventAction } from '@contracts/events';
import { EventsService } from '@modules/events';

import { OrganizationsCache } from '../caches';
import { OrganizationsRepository } from '../repositories';

@Injectable()
export class OrganizationsService {
  private readonly logger = new Logger(OrganizationsService.name);

  constructor(
    private readonly eventsService: EventsService,
    private readonly organizationsCache: OrganizationsCache,
    private readonly organizationsRepository: OrganizationsRepository,
  ) {}

  async findOneById(id: string): Promise<Organization | null> {
    const cachedData = await this.organizationsCache.findOneById(id);
    if (cachedData) {
      return cachedData;
    }

    const organization = await this.organizationsRepository.findOneById(id);
    if (!!organization) {
      await this.organizationsCache.set(organization);
    }

    return organization;
  }

  async findAll(args: OrganizationsArgs): Promise<[Organization[], number]> {
    return this.organizationsRepository.findAll(args);
  }

  async findAllByUserId(
    args: OrganizationsByUserArgs,
  ): Promise<[Organization[], number]> {
    return this.organizationsRepository.findAllByUserId(args);
  }

  async create(input: CreateOrganizationDto): Promise<Organization> {
    const slug = generate({
      length: 20,
      numbers: false,
      symbols: false,
      uppercase: false,
      lowercase: true,
    });

    const organization = await this.organizationsRepository.create({
      ...input,
      slug,
      updatedBy: input.createdBy,
    });
    await this.organizationsCache.set(organization);

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

    const updatedOrganiation = await this.organizationsRepository.update(
      id,
      rest,
    );

    await this.organizationsCache.set(updatedOrganiation);

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

    const updatedOrganiation = await this.organizationsRepository.update(id, {
      deletedBy,
      deletedAt: new Date(),
    });

    await this.organizationsCache.set(updatedOrganiation);

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
