import { Injectable, Logger } from '@nestjs/common';
import { User } from '@prisma/client';
import * as bcrypt from 'bcrypt';

import { PrismaService } from '@providers/db/prisma';
import {
  CreateUserDto,
  UpdateUserDto,
  DeleteUserDto,
  UsersArgs,
  UpdatePasswordDto,
} from '@contracts/users';

@Injectable()
export class UsersRepository {
  private readonly logger = new Logger(UsersRepository.name);

  constructor(private readonly prisma: PrismaService) {}

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

  async create(dto: CreateUserDto): Promise<User> {
    const { password } = dto;

    const salt = await bcrypt.genSalt();
    const hashedPassword = await bcrypt.hash(password, salt);

    const user = await this.prisma.user.create({
      data: {
        ...dto,
        password: hashedPassword,
        updatedBy: dto.createdBy,
      },
    });

    return user;
  }

  async update(dto: UpdateUserDto): Promise<User> {
    const { id, ...rest } = dto;

    return this.prisma.user.update({
      where: {
        id,
        deletedAt: null,
      },
      data: {
        ...rest,
      },
    });
  }

  async updatePassword(dto: UpdatePasswordDto): Promise<User> {
    const { newPassword, userId } = dto;

    const salt = await bcrypt.genSalt();
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    return this.prisma.user.update({
      where: {
        id: userId,
        deletedAt: null,
      },
      data: {
        password: hashedPassword,
        resetToken: null,
        resetTokenExpiresAt: null,
        updatedBy: dto.updatedBy,
      },
    });
  }

  async delete(dto: DeleteUserDto): Promise<User> {
    const { id, deletedBy } = dto;

    return this.prisma.user.update({
      where: {
        id,
        deletedAt: null,
      },
      data: {
        deletedBy,
        deletedAt: new Date(),
      },
    });
  }
}
