import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { User } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import { NotFoundException } from '@nestjs/common';
import { I18nService } from 'nestjs-i18n';

import {
  CreateUserDto,
  UpdateUserDto,
  DeleteUserDto,
  UsersArgs,
  UserCreatedEvent,
  UserUpdatedEvent,
  UserDeletedEvent,
  UserEvents,
  UpdatePasswordDto,
} from '@contracts/users';
import { EventAction } from '@contracts/events';
import { EventsService } from '@modules/events/services';

import { UsersCache } from '../cache';
import { UsersRepository } from '../repositories';

@Injectable()
export class UsersService {
  private readonly logger = new Logger(UsersService.name);

  constructor(
    private readonly usersCache: UsersCache,
    private readonly usersRepository: UsersRepository,
    private readonly eventsService: EventsService,
    private readonly i18nService: I18nService,
  ) {}

  async findOneById(id: string): Promise<User | null> {
    const cachedData = await this.usersCache.findOneById(id);
    if (cachedData) {
      return cachedData;
    }

    const user = await this.usersRepository.findOneById(id);
    if (!!user) {
      await this.usersCache.set(user);
    }

    return user;
  }

  async findOneByEmail(email: string): Promise<User | null> {
    const cachedData = await this.usersCache.findOneByEmail(email);
    if (cachedData) {
      return cachedData;
    }

    const user = await this.usersRepository.findOneByEmail(email);
    if (!!user) {
      await this.usersCache.set(user);
    }

    return user;
  }

  async findOneByUsername(username: string): Promise<User | null> {
    const cachedData = await this.usersCache.findOneByUsername(username);
    if (cachedData) {
      return cachedData;
    }

    const user = await this.usersRepository.findOneByUsername(username);
    if (!!user) {
      await this.usersCache.set(user);
    }

    return user;
  }

  async findAll(args: UsersArgs): Promise<[User[], number]> {
    return this.usersRepository.findAll(args);
  }

  async create(dto: CreateUserDto): Promise<User> {
    const user = await this.usersRepository.create(dto);

    await this.usersCache.set(user);

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

  async update(dto: UpdateUserDto): Promise<User> {
    const { id, ...rest } = dto;

    const user = await this.findOneById(id);
    if (!user) {
      throw new NotFoundException(id);
    }

    const updatedUser = await this.usersRepository.update(dto);

    await this.usersCache.set(updatedUser);

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

  async updatePassword(dto: UpdatePasswordDto): Promise<User> {
    const { confirmPassword, newPassword, currentPassword, userId } = dto;

    const user = await this.findOneById(userId);
    if (!user) {
      throw new NotFoundException(userId);
    }

    if (!!currentPassword) {
      const isMatch = await bcrypt.compare(currentPassword, user.password);
      if (!isMatch) {
        throw new BadRequestException(
          this.i18nService.translate('users.errors.invalid-password'),
        );
      }
    }

    if (newPassword !== confirmPassword) {
      throw new BadRequestException(
        this.i18nService.translate('users.errors.password-mismatch'),
      );
    }

    const updatedUser = await this.usersRepository.updatePassword(dto);

    await this.usersCache.set(updatedUser);

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

  async delete(dto: DeleteUserDto): Promise<User> {
    const { id, deletedBy } = dto;

    const user = await this.findOneById(id);
    if (!user) {
      throw new NotFoundException(id);
    }

    const updatedUser = await this.usersRepository.delete(dto);

    await this.usersCache.delete(updatedUser.id);

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
