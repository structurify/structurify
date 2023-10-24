import { Injectable, Inject, Logger } from '@nestjs/common';
import { User } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import { NotFoundException } from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';

import { PrismaService } from '@providers/db/prisma/services/prisma.service';
import { EventsService } from '@modules/events/services';
import {
  CreateUserDto,
  UpdateUserDto,
  DeleteUserDto,
  UsersArgs,
  UserCreatedEvent,
  UserUpdatedEvent,
  UserDeletedEvent,
  UserEvents,
} from '@contracts/users';
import { EventAction } from '@contracts/events';

@Injectable()
export class UsersService {
  private readonly logger = new Logger(UsersService.name);

  constructor(
    @Inject(CACHE_MANAGER) private cacheService: Cache,
    private readonly prisma: PrismaService,
    private readonly eventsService: EventsService,
  ) {}

  async findOneById(id: string): Promise<User | null> {
    const cachedData = await this.cacheService.get<User>(`User-${id}/ID`);
    if (cachedData) {
      this.logger.debug(`User-${id}/ID found in cache`);
      return cachedData;
    }

    const user = await this.prisma.user.findUnique({
      where: {
        id,
        deletedAt: null,
      },
    });

    if (!!user) {
      await this.cacheService.set(`User-${id}/ID`, user);
      this.logger.debug(`User-${id}/ID stored in cache`);
    }

    return user;
  }

  async findOneByEmail(email: string): Promise<User | null> {
    const cachedData = await this.cacheService.get<User>(`User-${email}/Email`);
    if (cachedData) {
      this.logger.debug(`User-${email}/Email found in cache`);
      return cachedData;
    }

    const user = await this.prisma.user.findUnique({
      where: {
        email,
        deletedAt: null,
      },
    });

    if (!!user) {
      await this.cacheService.set(`User-${email}/Email`, user);
      this.logger.debug(`User-${email}/Email stored in cache`);
    }

    return user;
  }

  async findOneByUsername(username: string): Promise<User | null> {
    const cachedData = await this.cacheService.get<User>(
      `User-${username}/Username`,
    );
    if (cachedData) {
      this.logger.debug(`User-${username}/Username found in cache`);
      return cachedData;
    }

    const user = await this.prisma.user.findUnique({
      where: {
        username,
        deletedAt: null,
      },
    });

    if (!!user) {
      await this.cacheService.set(`User-${username}/Username`, user);
      this.logger.debug(`User-${username}/Username stored in cache`);
    }

    return user;
  }

  async findAll(args: UsersArgs): Promise<[User[], number]> {
    return Promise.all([
      this.prisma.user.findMany({
        ...args,
        where: {
          deletedAt: null,
        },
      }),
      this.prisma.user.count({
        ...args,
        where: {
          deletedAt: null,
        },
      }),
    ]);
  }

  async create(input: CreateUserDto): Promise<User> {
    const { password } = input;

    const salt = await bcrypt.genSalt();
    const hashedPassword = await bcrypt.hash(password, salt);

    const user = await this.prisma.user.create({
      data: {
        ...input,
        password: hashedPassword,
        updatedBy: input.createdBy,
      },
    });

    await this.cacheService.set(`User-${user.id}/ID`, user);
    this.logger.debug(`User-${user.id}/ID stored in cache`);

    this.eventsService.emitEvent({
      entity: 'User',
      entityId: `User-${user.id}`,
      eventName: UserEvents.USER_CREATED,
      event: new UserCreatedEvent(),
      action: EventAction.CREATE,
      after: user,
    });

    return user;
  }

  async update(input: UpdateUserDto): Promise<User> {
    const { id, ...rest } = input;

    const user = await this.findOneById(id);
    if (!user) {
      throw new NotFoundException(id);
    }

    const updatedUser = await this.prisma.user.update({
      where: {
        id,
        deletedAt: null,
      },
      data: {
        ...rest,
      },
    });

    await this.cacheService.set(`User-${updatedUser.id}/ID`, updatedUser);
    this.logger.debug(`User-${updatedUser.id}/ID updated in cache`);

    this.eventsService.emitEvent({
      entity: 'User',
      entityId: `User-${user.id}`,
      eventName: UserEvents.USER_UPDATED,
      event: new UserUpdatedEvent(),
      action: EventAction.UPDATE,
      before: user,
      after: updatedUser,
    });

    return updatedUser;
  }

  async delete(input: DeleteUserDto): Promise<User> {
    const { id, deletedBy } = input;

    const user = await this.findOneById(id);
    if (!user) {
      throw new NotFoundException(id);
    }

    const updatedUser = await this.prisma.user.update({
      where: {
        id,
        deletedAt: null,
      },
      data: {
        deletedBy,
        deletedAt: new Date(),
      },
    });

    await this.cacheService.del(`User-${updatedUser.id}/ID`);
    this.logger.debug(`User-${updatedUser.id}/ID deleted from cache`);

    this.eventsService.emitEvent({
      entity: 'User',
      entityId: `User-${user.id}`,
      eventName: UserEvents.USER_DELETED,
      event: new UserDeletedEvent(),
      action: EventAction.DELETE,
      before: user,
      after: updatedUser,
    });

    return updatedUser;
  }
}
