import { Module } from '@nestjs/common';

import { CoreModule } from '@modules/core';
import { PlatformCaslModule } from '@modules/platform-casl';
import { OrganizationsModule } from '@modules/organizations';

import { ProjectsService, ApiKeysService } from './services';
import { ProjectResolver, ApiKeyResolver } from './resolvers';
import { ProjectsRepository, ApiKeysRepository } from './repositories';
import { ProjectsCache, ApiKeysCache } from './caches';
import { ProjectsListener } from './listeners';

@Module({
  imports: [CoreModule, OrganizationsModule, PlatformCaslModule],
  providers: [
    ApiKeysService,
    ApiKeyResolver,
    ApiKeysRepository,
    ApiKeysCache,
    ProjectsCache,
    ProjectsListener,
    ProjectsService,
    ProjectResolver,
    ProjectsRepository,
  ],
  exports: [ProjectsService, ProjectsRepository, ProjectsCache],
})
export class ProjectsModule {}
