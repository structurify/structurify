import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';

import { EventsService } from '@modules/events';

import { ApiKeysService } from './api-keys.service';
import { ApiKeysRepository } from '../repositories';
import { ApiKeysCache } from '../caches';

describe('ApiKeysService', () => {
  let service: ApiKeysService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ApiKeysService,
        { provide: ApiKeysRepository, useValue: {} },
        { provide: ApiKeysCache, useValue: {} },
        { provide: ConfigService, useValue: {} },
        { provide: EventsService, useValue: {} },
      ],
    }).compile();

    service = module.get<ApiKeysService>(ApiKeysService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
