import { Test, TestingModule } from '@nestjs/testing';

import { SearchService } from '../services';
import { EventListener } from './event.listener';

describe('EventListener', () => {
  let service: EventListener;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [EventListener, { provide: SearchService, useValue: {} }],
    }).compile();

    service = module.get<EventListener>(EventListener);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
