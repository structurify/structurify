import { Test, TestingModule } from '@nestjs/testing';

import { EventsService } from '@modules/events';

import { ProjectsService } from './projects.service';
import { ProjectsCache } from '../caches';
import { ProjectsRepository } from '../repositories';

describe('ProjectsService', () => {
  let service: ProjectsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProjectsService,
        { provide: EventsService, useValue: {} },
        { provide: ProjectsRepository, useValue: {} },
        { provide: ProjectsCache, useValue: {} },
      ],
    }).compile();

    service = module.get<ProjectsService>(ProjectsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
