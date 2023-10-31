import { Injectable, Inject, Logger } from '@nestjs/common';
import { Project } from '@prisma/client';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';

@Injectable()
export class ProjectsCache {
  private readonly logger = new Logger(ProjectsCache.name);

  constructor(@Inject(CACHE_MANAGER) private cacheService: Cache) {}

  async findOneById(id: string) {
    const entry = await this.cacheService.get<Project>(`Project-${id}/ID`);

    if (!!entry) {
      this.logger.debug(`Project-${id}/ID found in cache`);
    }

    return entry;
  }

  async set(Project: Project) {
    await this.cacheService.set(`Project-${Project.id}/ID`, Project);
    this.logger.debug(`Project-${Project.id}/ID stored in cache`);
  }

  async delete(id: string) {
    await this.cacheService.del(`Project-${id}/ID`);
    this.logger.debug(`Project-${id}/ID deleted from cache`);
  }
}
