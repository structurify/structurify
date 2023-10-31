import { Test, TestingModule } from '@nestjs/testing';
import { CACHE_MANAGER } from '@nestjs/cache-manager';

import { MembersCache } from './members.cache';

describe('MembersCache', () => {
  let service: MembersCache;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [MembersCache, { provide: CACHE_MANAGER, useValue: {} }],
    }).compile();

    service = module.get<MembersCache>(MembersCache);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
