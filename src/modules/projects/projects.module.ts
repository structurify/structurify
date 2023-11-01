import { Module } from '@nestjs/common';

import { CoreModule } from '@modules/core';
import { PlatformCaslModule } from '@modules/platform-casl';
import { OrganizationsModule } from '@modules/organizations';

import { ProjectsService } from './services';
import { ProjectResolver } from './resolvers';
import { ProjectsRepository } from './repositories';
import { ProjectsCache } from './caches';

@Module({
  imports: [CoreModule, OrganizationsModule, PlatformCaslModule],
  providers: [
    ProjectsService,
    ProjectResolver,
    ProjectsRepository,
    ProjectsCache,
  ],
  exports: [ProjectsService, ProjectsRepository, ProjectsCache],
})
export class ProjectsModule {}
