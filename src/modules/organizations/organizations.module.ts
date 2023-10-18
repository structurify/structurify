import { Module } from '@nestjs/common';

import { UsersModule } from '@modules/users/users.module';
import { UsersService } from '@modules/users/services';
import {
  OrganizationsService,
  ProjectsService,
  MembersService,
} from './services';
import { OrganizationResolver, ProjectResolver } from './resolvers';
import { UserListener } from './listeners';
import { InviteJob } from './jobs';

@Module({
  imports: [UsersModule],
  providers: [
    OrganizationsService,
    ProjectsService,
    OrganizationResolver,
    ProjectResolver,
    UsersService,
    UserListener,
    InviteJob,
    MembersService,
  ],
  exports: [OrganizationsService, ProjectsService, MembersService],
})
export class OrganizationsModule {}
