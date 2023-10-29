import { Module } from '@nestjs/common';

import { CommunicationModule } from '@modules/communication/communication.module';
import { MailingRepository } from '@modules/communication/repositories';
import {
  PlatformCaslModule,
  PlatformCaslAbilityFactory,
} from '@modules/platform-casl/';

import { UsersService } from './services';
import { UserListener } from './listeners';
import { UserResolver } from './resolvers';

@Module({
  imports: [CommunicationModule, PlatformCaslModule],
  providers: [
    UsersService,
    MailingRepository,
    UserListener,
    UserResolver,
    PlatformCaslAbilityFactory,
  ],
  exports: [UsersService],
})
export class UsersModule {}
