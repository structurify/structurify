import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { ApiKey } from '@prisma/client';
import crypto from 'crypto';

import { EventsService } from '@modules/events/services';
import {
  CreateApiKeyDto,
  DeleteApiKeyDto,
  UpdateApiKeyDto,
  ApiKeysArgs,
  ProjectEvents,
  ApiKeyCreatedEvent,
  ApiKeyDeletedEvent,
  ApiKeyUpdatedEvent,
} from '@contracts/projects';
import { EventAction } from '@contracts/events';
import { generateRandomString } from '@app/shared/utils';

import { ApiKeysRepository } from '../repositories';
import { ApiKeysCache } from '../caches';

@Injectable()
export class ApiKeysService {
  private readonly logger = new Logger(ApiKeysService.name);

  constructor(
    private readonly eventsService: EventsService,
    private readonly apiKeysCache: ApiKeysCache,
    private readonly apiKeysRepository: ApiKeysRepository,
  ) {}

  async findOneById(id: string): Promise<ApiKey | null> {
    const cachedData = await this.apiKeysCache.findOneById(id);
    if (cachedData) {
      return cachedData;
    }

    const apiKey = await this.apiKeysRepository.findOneById(id);
    if (!!apiKey) {
      await this.apiKeysCache.set(apiKey);
    }

    return apiKey;
  }

  async findAll(args: ApiKeysArgs): Promise<[ApiKey[], number]> {
    return this.apiKeysRepository.findAll(args);
  }

  async create(dto: CreateApiKeyDto): Promise<ApiKey> {
    const accessKey = generateRandomString();
    const secretKeyBase = generateRandomString(64);

    const hmac = crypto
      .createHmac('sha256', 'xyz')
      .update(secretKeyBase)
      .digest('hex');

    const apiKey = await this.apiKeysRepository.create({
      accessKey: accessKey.toUpperCase(),
      secretKey: hmac,
      updatedBy: dto.createdBy,
      ...dto,
    });

    await this.apiKeysCache.set(apiKey);

    this.eventsService.emitEvent({
      entity: 'ApiKey',
      entityId: `Project-${apiKey.projectId}/ApiKey-${apiKey.id}`,
      eventName: ProjectEvents.API_KEY_CREATED,
      event: new ApiKeyCreatedEvent(),
      action: EventAction.CREATE,
      after: apiKey,
    });

    return {
      ...apiKey,
      secretKey: secretKeyBase,
    };
  }

  async update(dto: UpdateApiKeyDto): Promise<ApiKey> {
    const { id, ...data } = dto;

    const apiKey = await this.findOneById(id);
    if (!apiKey) {
      throw new NotFoundException(id);
    }

    const updatedApiKey = await this.apiKeysRepository.update(id, data);

    await this.apiKeysCache.set(updatedApiKey);

    this.eventsService.emitEvent({
      entity: 'ApiKey',
      entityId: `Project-${apiKey.projectId}/ApiKey-${apiKey.id}`,
      eventName: ProjectEvents.API_KEY_UPDATED,
      event: new ApiKeyUpdatedEvent(),
      action: EventAction.UPDATE,
      before: apiKey,
      after: updatedApiKey,
    });

    return updatedApiKey;
  }

  async delete(dto: DeleteApiKeyDto): Promise<ApiKey> {
    const { id, deletedBy } = dto;

    const apiKey = await this.findOneById(id);
    if (!apiKey) {
      throw new NotFoundException(id);
    }

    const updatedApiKey = await this.apiKeysRepository.update(id, {
      deletedBy,
      deletedAt: new Date(),
    });

    await this.apiKeysCache.delete(updatedApiKey.id);

    this.eventsService.emitEvent({
      entity: 'ApiKey',
      entityId: `Project-${apiKey.projectId}/ApiKey-${apiKey.id}`,
      eventName: ProjectEvents.API_KEY_DELETED,
      event: new ApiKeyDeletedEvent(),
      action: EventAction.DELETE,
      before: apiKey,
      after: updatedApiKey,
    });

    return updatedApiKey;
  }
}
