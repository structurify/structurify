import { Test, TestingModule } from '@nestjs/testing';
import { I18nService } from 'nestjs-i18n';

import { EventsService } from '@modules/events';

import { UsersService } from './users.service';
import { UsersCache } from '../cache';
import { UsersRepository } from '../repositories';

describe('UsersService', () => {
  let service: UsersService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        { provide: UsersRepository, useValue: {} },
        { provide: UsersCache, useValue: {} },
        { provide: EventsService, useValue: {} },
        { provide: I18nService, useValue: {} },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
