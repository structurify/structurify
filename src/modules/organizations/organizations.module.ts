import { Module } from '@nestjs/common';

import { UsersModule } from '@modules/users/users.module';
import { UsersService } from '@modules/users/services';

import { CommunicationModule } from '@modules/communication/communication.module';
import { CoreModule } from '@modules/core/core.module';
import {
  PlatformCaslModule,
  PlatformCaslAbilityFactory,
} from '@modules/platform-casl/';

import {
  OrganizationsService,
  MembersService,
  InvitesService,
} from './services';
import { MailingRepository } from '../communication/repositories';
import {
  OrganizationResolver,
  InviteResolver,
  MemberResolver,
} from './resolvers';
import { UserListener } from './listeners';
import { InviteJob } from './jobs';

@Module({
  imports: [UsersModule, CommunicationModule, CoreModule, PlatformCaslModule],
  providers: [
    OrganizationsService,
    OrganizationResolver,
    UsersService,
    UserListener,
    InviteJob,
    MembersService,
    InvitesService,
    MailingRepository,
    InviteResolver,
    MemberResolver,
    PlatformCaslAbilityFactory,
  ],
  exports: [
    OrganizationsService,
    MembersService,
    InvitesService,
  ],
})
export class OrganizationsModule {}
