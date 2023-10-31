import { Test, TestingModule } from '@nestjs/testing';
import { CACHE_MANAGER } from '@nestjs/cache-manager';

import { OrganizationsCache } from './organizations.cache';

describe('OrganizationsCache', () => {
  let service: OrganizationsCache;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [OrganizationsCache, { provide: CACHE_MANAGER, useValue: {} }],
    }).compile();

    service = module.get<OrganizationsCache>(OrganizationsCache);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
