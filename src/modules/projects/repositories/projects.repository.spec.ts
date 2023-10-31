import { Test, TestingModule } from '@nestjs/testing';
import { CACHE_MANAGER } from '@nestjs/cache-manager';

import { ProjectsRepository } from './projects.repository';
import { PrismaService } from '@providers/db/prisma/services';

describe('ProjectsRepository', () => {
  let service: ProjectsRepository;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ProjectsRepository, { provide: PrismaService, useValue: {} }],
    }).compile();

    service = module.get<ProjectsRepository>(ProjectsRepository);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
