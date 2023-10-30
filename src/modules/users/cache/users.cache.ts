import {
    Injectable,
    Inject,
    Logger,
  } from '@nestjs/common';
  import { User } from '@prisma/client';
  import { CACHE_MANAGER } from '@nestjs/cache-manager';
  import { Cache } from 'cache-manager';
  
  @Injectable()
  export class UsersCache {
    private readonly logger = new Logger(UsersCache.name);
  
    constructor(
      @Inject(CACHE_MANAGER) private cacheService: Cache,
    ) {}
  
    async findOneById(id: string) {
      const entry = await this.cacheService.get<User>(`User-${id}/ID`);

      if(!!entry) {
        this.logger.debug(`User-${id}/ID found in cache`);
      }

      return entry;
    }
  
    async findOneByEmail(email: string) {
      const entry = await this.cacheService.get<User>(`User-${email}/Email`);

      if(!!entry) {
        this.logger.debug(`User-${email}/Email found in cache`);
      }

      return entry;
    }
  
    async findOneByUsername(username: string) {
        const entry = await this.cacheService.get<User>(
        `User-${username}/Username`,
      );

      
      if(!!entry) {
        this.logger.debug(`User-${username}/Username found in cache`);
      }

      return entry;
    }
  
    async set(user: User) {
      await this.cacheService.set(`User-${user.id}/ID`, user);
      this.logger.debug(`User-${user.id}/ID stored in cache`);
    }
  
    async delete(id: string) {
      await this.cacheService.del(`User-${id}/ID`);
      this.logger.debug(`User-${id}/ID deleted from cache`);
      }
  }
  