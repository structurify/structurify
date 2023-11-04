import { Test, TestingModule } from '@nestjs/testing';

import { ProjectsListener } from './projects.listener';
import { ProjectsService } from '../services';

describe('ProjectsListener', () => {
  let service: ProjectsListener;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ProjectsListener, { provide: ProjectsService, useValue: {} }],
    }).compile();

    service = module.get<ProjectsListener>(ProjectsListener);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
