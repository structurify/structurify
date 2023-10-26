import { Module } from '@nestjs/common';

import { CommunicationModule } from '@modules/communication/communication.module';
import { MailingRepository } from '@modules/communication/repositories';

import { UsersService } from './services';
import { UserListener } from './listeners';
import { UserResolver } from './resolvers';

@Module({
  imports: [CommunicationModule],
  providers: [UsersService, MailingRepository, UserListener, UserResolver],
  exports: [UsersService],
})
export class UsersModule {}
