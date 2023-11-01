import { Test, TestingModule } from '@nestjs/testing';

import { EventsService } from '@modules/events';

import { OrganizationsService } from './organizations.service';
import { OrganizationsCache } from '../caches';
import { OrganizationsRepository } from '../repositories';

describe('OrganizationsService', () => {
  let service: OrganizationsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        OrganizationsService,
        { provide: EventsService, useValue: {} },
        { provide: OrganizationsRepository, useValue: {} },
        { provide: OrganizationsCache, useValue: {} },
      ],
    }).compile();

    service = module.get<OrganizationsService>(OrganizationsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
