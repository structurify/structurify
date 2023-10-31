import { Injectable, Inject, Logger } from '@nestjs/common';
import { Organization } from '@prisma/client';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';

@Injectable()
export class OrganizationsCache {
  private readonly logger = new Logger(OrganizationsCache.name);

  constructor(@Inject(CACHE_MANAGER) private cacheService: Cache) {}

  async findOneById(id: string) {
    const entry = await this.cacheService.get<Organization>(
      `Organization-${id}/ID`,
    );

    if (!!entry) {
      this.logger.debug(`Organization-${id}/ID found in cache`);
    }

    return entry;
  }

  async set(organization: Organization) {
    await this.cacheService.set(
      `Organization-${organization.id}/ID`,
      organization,
    );
    this.logger.debug(`Organization-${organization.id}/ID stored in cache`);
  }

  async delete(id: string) {
    await this.cacheService.del(`Organization-${id}/ID`);
    this.logger.debug(`Organization-${id}/ID deleted from cache`);
  }
}
