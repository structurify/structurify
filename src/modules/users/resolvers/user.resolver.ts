import { Query, Mutation, Resolver, Args } from '@nestjs/graphql';
import { Logger, UseGuards } from '@nestjs/common';

import { JwtAuthGuard } from '@modules/auth/guards';
import { User } from '@prisma/client';
import { CurrentUser } from '@decorators/current-user.decorator';
import { UpdatePasswordInput, User as UserModel } from '@app/contracts/users';

import { UsersService } from '../services';

@UseGuards(JwtAuthGuard)
@Resolver()
export class UserResolver {
  private readonly logger = new Logger(UserResolver.name);

  constructor(private readonly usersService: UsersService) {}

  @Query((_) => UserModel)
  async me(@CurrentUser() user: User): Promise<User> {
    return user;
  }

  @Mutation((_) => UserModel)
  async updatePassword(
    @Args('input') input: UpdatePasswordInput,
    @CurrentUser() user: User,
  ): Promise<User> {
    return this.usersService.updatePassword({
      ...input,
      userId: user.id,
      updatedBy: {
        user: user.id,
      },
    });
  }
}
