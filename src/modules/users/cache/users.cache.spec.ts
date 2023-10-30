import { Test, TestingModule } from '@nestjs/testing';
import { CACHE_MANAGER } from '@nestjs/cache-manager';

import { UsersCache } from './users.cache';

describe('UsersCache', () => {
  let service: UsersCache;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersCache,
        { provide: CACHE_MANAGER, useValue: {} },
      ],
    }).compile();

    service = module.get<UsersCache>(UsersCache);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
