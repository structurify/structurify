import { Injectable, Inject, Logger } from '@nestjs/common';
import { ApiKey } from '@prisma/client';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';

@Injectable()
export class ApiKeysCache {
  private readonly logger = new Logger(ApiKeysCache.name);

  constructor(@Inject(CACHE_MANAGER) private cacheService: Cache) {}

  async findOneById(id: string) {
    const entry = await this.cacheService.get<ApiKey>(`ApiKey-${id}/ID`);

    if (!!entry) {
      this.logger.debug(`ApiKey-${id}/ID found in cache`);
    }

    return entry;
  }

  async set(ApiKey: ApiKey) {
    await this.cacheService.set(`ApiKey-${ApiKey.id}/ID`, ApiKey);
    this.logger.debug(`ApiKey-${ApiKey.id}/ID stored in cache`);
  }

  async delete(id: string) {
    await this.cacheService.del(`ApiKey-${id}/ID`);
    this.logger.debug(`ApiKey-${id}/ID deleted from cache`);
  }
}
