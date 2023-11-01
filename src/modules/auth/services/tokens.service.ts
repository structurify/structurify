import { Injectable, Inject, Logger } from '@nestjs/common';
import { Token } from '@prisma/client';
import { NotFoundException } from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';

import { PrismaService } from '@providers/db/prisma';
import { EventsService } from '@modules/events/services';

import { EventAction } from '@contracts/events';
import {
  CreateTokenDto,
  AuthEvents,
  TokenCreatedEvent,
  DeleteForUsersTokensDto,
  UpdateTokenDto,
  TokenUpdatedEvent,
} from '@contracts/auth';

@Injectable()
export class TokensService {
  private readonly logger = new Logger(TokensService.name);

  constructor(
    @Inject(CACHE_MANAGER) private cacheService: Cache,
    private readonly prisma: PrismaService,
    private readonly eventsService: EventsService,
  ) {}

  async findOneById(id: string): Promise<Token | null> {
    const cachedData = await this.cacheService.get<Token>(`Token-${id}/ID`);
    if (cachedData) {
      this.logger.debug(`Token-${id}/ID found in cache`);
      return cachedData;
    }

    const token = await this.prisma.token.findUnique({
      where: {
        id,
        deletedAt: null,
      },
    });

    if (!!token) {
      await this.cacheService.set(`Token-${id}/ID`, token);
      this.logger.debug(`Token-${id}/ID stored in cache`);
    }

    return token;
  }

  async findOneByToken(refreshToken: string): Promise<Token | null> {
    const cachedData = await this.cacheService.get<Token>(
      `Token-${refreshToken}/Token`,
    );
    if (cachedData) {
      this.logger.debug(`Token-${refreshToken}/Token found in cache`);
      return cachedData;
    }

    const token = await this.prisma.token.findFirst({
      where: {
        refreshToken,
        deletedAt: null,
      },
    });

    if (!!token) {
      await this.cacheService.set(`Token-${refreshToken}/ID`, token);
      this.logger.debug(`Token-${refreshToken}/ID stored in cache`);
    }

    return token;
  }

  async create(createTokenDto: CreateTokenDto): Promise<Token> {
    const token = await this.prisma.token.create({
      data: {
        ...createTokenDto,
        updatedBy: createTokenDto.createdBy,
      },
    });

    await this.cacheService.set(`Token-${token.id}/ID`, token);
    this.logger.debug(`Token-${token.id}/ID stored in cache`);

    this.eventsService.emitEvent({
      entity: 'Token',
      entityId: `User-${createTokenDto.userId}/Token-${token.id}`,
      eventName: AuthEvents.AUTH_TOKEN_CREATED,
      event: new TokenCreatedEvent(),
      action: EventAction.CREATE,
      after: token,
    });

    return token;
  }

  async update(input: UpdateTokenDto): Promise<Token> {
    const { id, ...rest } = input;

    const token = await this.findOneById(id);
    if (!token) {
      throw new NotFoundException(id);
    }

    const updatedToken = await this.prisma.token.update({
      where: {
        id,
        deletedAt: null,
      },
      data: {
        ...rest,
      },
    });

    await this.cacheService.set(`Token-${updatedToken.id}/ID`, updatedToken);
    this.logger.debug(`Token-${updatedToken.id}/ID updated in cache`);

    this.eventsService.emitEvent({
      entity: 'Token',
      entityId: `User-${token.userId}/Token-${token.id}`,
      eventName: AuthEvents.AUTH_TOKEN_UPDATED,
      event: new TokenUpdatedEvent(),
      action: EventAction.UPDATE,
      before: token,
      after: updatedToken,
    });

    return updatedToken;
  }

  async deleteForUser(dto: DeleteForUsersTokensDto): Promise<void> {
    const removedTokens = await this.prisma.token.updateMany({
      where: {
        userId: dto.userId,
        deletedAt: null,
      },
      data: {
        deletedBy: dto.deletedBy,
        deletedAt: new Date(),
      },
    });
  }
}
