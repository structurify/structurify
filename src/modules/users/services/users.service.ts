import { Injectable, Logger } from '@nestjs/common';
import { User } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import { NotFoundException } from '@nestjs/common';

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
    private readonly prisma: PrismaService,
    private readonly eventsService: EventsService,
  ) {}

  async findOneById(id: string): Promise<User | null> {
    return this.prisma.user.findUnique({
      where: {
        id,
        deletedAt: null,
      },
    });
  }

  async findOneByEmail(email: string): Promise<User | null> {
    return this.prisma.user.findUnique({
      where: {
        email,
        deletedAt: null,
      },
    });
  }

  async findOneByUsername(username: string): Promise<User | null> {
    return this.prisma.user.findUnique({
      where: {
        username,
        deletedAt: null,
      },
    });
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
