import { Test, TestingModule } from '@nestjs/testing';

import { EventListener } from './event.listener';
import { DataLakeStorageService } from '../services/data-lake-storage.service';

describe('EventListener', () => {
  let service: EventListener;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        EventListener,
        {
          provide: DataLakeStorageService,
          useValue: {},
        },
      ],
    }).compile();

    service = module.get<EventListener>(EventListener);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
