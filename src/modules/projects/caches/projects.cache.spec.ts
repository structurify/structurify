import { Test, TestingModule } from '@nestjs/testing';
import { CACHE_MANAGER } from '@nestjs/cache-manager';

import { ProjectsCache } from './projects.cache';

describe('ProjectsCache', () => {
  let service: ProjectsCache;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ProjectsCache, { provide: CACHE_MANAGER, useValue: {} }],
    }).compile();

    service = module.get<ProjectsCache>(ProjectsCache);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
