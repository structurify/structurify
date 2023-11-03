import { Test, TestingModule } from '@nestjs/testing';
import { CACHE_MANAGER } from '@nestjs/cache-manager';

import { ApiKeysCache } from './api-keys.cache';

describe('ApiKeysCache', () => {
  let service: ApiKeysCache;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ApiKeysCache, { provide: CACHE_MANAGER, useValue: {} }],
    }).compile();

    service = module.get<ApiKeysCache>(ApiKeysCache);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
