import { Query, Resolver } from '@nestjs/graphql';
import { Logger, UseGuards } from '@nestjs/common';

import { JwtAuthGuard } from '@modules/auth/guards';
import { User } from '@prisma/client';
import { CurrentUser } from '@decorators/current-user.decorator';
import { User as UserModel } from '@app/contracts/users';

@UseGuards(JwtAuthGuard)
@Resolver()
export class UserResolver {
  private readonly logger = new Logger(UserResolver.name);

  constructor() {}

  @Query((_) => UserModel)
  async me(@CurrentUser() user: User): Promise<User> {
    return user;
  }
}
