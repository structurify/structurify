import { Injectable, Inject, Logger } from '@nestjs/common';
import { Member } from '@prisma/client';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';

@Injectable()
export class MembersCache {
  private readonly logger = new Logger(MembersCache.name);

  constructor(@Inject(CACHE_MANAGER) private cacheService: Cache) {}

  async findOneById(organizationId: string, userId: string) {
    const entry = await this.cacheService.get<Member>(
      `Organization-${organizationId}/User-${userId}`,
    );

    if (!!entry) {
      this.logger.debug(
        `Organization-${organizationId}/User-${userId} found in cache`,
      );
    }

    return entry;
  }

  async set(member: Member) {
    await this.cacheService.set(
      `Organization-${member.organizationId}/User-${member.userId}`,
      member,
    );
    this.logger.debug(
      `Organization-${member.organizationId}/User-${member.userId} stored in cache`,
    );
  }

  async delete(organizationId: string, userId: string) {
    await this.cacheService.del(
      `Organization-${organizationId}/User-${userId}`,
    );
    this.logger.debug(
      `Organization-${organizationId}/User-${userId} deleted from cache`,
    );
  }
}
