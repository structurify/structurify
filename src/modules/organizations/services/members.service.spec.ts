import { Test, TestingModule } from '@nestjs/testing';

import { EventsService } from '@modules/events';

import { MembersService } from './members.service';
import { MembersCache } from '../caches';
import { MembersRepository } from '../repositories';

describe('MembersService', () => {
  let service: MembersService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MembersService,
        { provide: EventsService, useValue: {} },
        { provide: MembersRepository, useValue: {} },
        { provide: MembersCache, useValue: {} },
      ],
    }).compile();

    service = module.get<MembersService>(MembersService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
