import { Module } from '@nestjs/common';

import { UsersModule } from '@modules/users/users.module';
import { UsersService } from '@modules/users/services';

import { CommunicationModule } from '@modules/communication';
import { CoreModule } from '@modules/core';
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
import { InvitesCache, MembersCache, OrganizationsCache } from './caches';
import {
  InvitesRepository,
  MembersRepository,
  OrganizationsRepository,
} from './repositories';

@Module({
  imports: [UsersModule, CommunicationModule, CoreModule, PlatformCaslModule],
  providers: [
    OrganizationsService,
    OrganizationResolver,
    OrganizationsCache,
    OrganizationsRepository,
    UsersService,
    UserListener,
    InviteJob,
    InvitesCache,
    InvitesService,
    InviteResolver,
    InvitesRepository,
    MembersCache,
    MembersService,
    MemberResolver,
    MembersRepository,
    MailingRepository,
    PlatformCaslAbilityFactory,
  ],
  exports: [
    OrganizationsCache,
    OrganizationsService,
    OrganizationsRepository,
    MembersCache,
    MembersService,
    MembersRepository,
    InvitesCache,
    InvitesService,
    InvitesRepository,
  ],
})
export class OrganizationsModule {}
