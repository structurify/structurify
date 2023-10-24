import { Module } from '@nestjs/common';

import { UsersModule } from '@modules/users/users.module';
import { UsersService } from '@modules/users/services';
import {
  OrganizationsService,
  ProjectsService,
  MembersService,
  InvitationsService,
} from './services';
import { CommunicationModule } from '@modules/communication/communication.module';
import { MailingRepository } from '../communication/repositories';
import {
  OrganizationResolver,
  ProjectResolver,
  InviteResolver,
  MemberResolver,
} from './resolvers';
import { UserListener } from './listeners';
import { InviteJob } from './jobs';

@Module({
  imports: [UsersModule, CommunicationModule],
  providers: [
    OrganizationsService,
    ProjectsService,
    OrganizationResolver,
    ProjectResolver,
    UsersService,
    UserListener,
    InviteJob,
    MembersService,
    InvitationsService,
    MailingRepository,
    InviteResolver,
    MemberResolver,
  ],
  exports: [
    OrganizationsService,
    ProjectsService,
    MembersService,
    InvitationsService,
  ],
})
export class OrganizationsModule {}
