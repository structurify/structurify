import { Injectable, Inject, Logger } from '@nestjs/common';
import { Invite } from '@prisma/client';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';

@Injectable()
export class InvitesCache {
  private readonly logger = new Logger(InvitesCache.name);

  constructor(@Inject(CACHE_MANAGER) private cacheService: Cache) {}

  async findOneById(id: string) {
    const entry = await this.cacheService.get<Invite>(`Invite-${id}/ID`);

    if (!!entry) {
      this.logger.debug(`Invite-${id}/ID found in cache`);
    }

    return entry;
  }

  async findOneByToken(token: string) {
    const entry = await this.cacheService.get<Invite>(`Invite-${token}/Token`);

    if (!!entry) {
      this.logger.debug(`Invite-${token}/Token found in cache`);
    }

    return entry;
  }

  async set(invite: Invite) {
    await Promise.all([
      this.cacheService.set(`Invite-${invite.id}/ID`, invite),
      this.cacheService.set(`Invite-${invite.token}/Token`, invite),
    ]);

    this.logger.debug(`Invite-${invite.id}/ID stored in cache`);
    this.logger.debug(`Invite-${invite.token}/Token stored in cache`);
  }

  async delete(id: string) {
    await this.cacheService.del(`Invite-${id}/ID`);
    this.logger.debug(`Invite-${id}/ID deleted from cache`);
  }
}
