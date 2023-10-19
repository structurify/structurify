import { Module } from '@nestjs/common';

import { CommunicationModule } from '@modules/communication/communication.module';
import { MailingRepository } from '@modules/communication/repositories';
import { UsersService } from './services';
import { UserListener } from './listeners';

@Module({
  imports: [CommunicationModule],
  providers: [UsersService, MailingRepository, UserListener],
  exports: [UsersService],
})
export class UsersModule {}
