import { Test, TestingModule } from '@nestjs/testing';
import { CACHE_MANAGER } from '@nestjs/cache-manager';

import { InvitesCache } from './invites.cache';

describe('InvitesCache', () => {
  let service: InvitesCache;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [InvitesCache, { provide: CACHE_MANAGER, useValue: {} }],
    }).compile();

    service = module.get<InvitesCache>(InvitesCache);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
