import { Module } from '@nestjs/common';

import { UsersModule } from '@modules/users/users.module';
import { CommunicationModule } from '@modules/communication';
import { CoreModule } from '@modules/core';
import { PlatformCaslModule } from '@modules/platform-casl/';

import {
  OrganizationsService,
  MembersService,
  InvitesService,
} from './services';
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
