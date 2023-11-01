import { Module } from '@nestjs/common';

import { CommunicationModule } from '@modules/communication';
import { PlatformCaslModule } from '@modules/platform-casl/';

import { UsersCache } from './cache';
import { UserListener } from './listeners';
import { UserResolver } from './resolvers';
import { UsersRepository } from './repositories';
import { UsersService } from './services';

@Module({
  imports: [CommunicationModule, PlatformCaslModule],
  providers: [
    UsersService,
    UsersCache,
    UserListener,
    UserResolver,
    UsersRepository,
  ],
  exports: [UsersService, UsersCache, UsersRepository],
})
export class UsersModule {}
