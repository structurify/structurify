import { Test, TestingModule } from '@nestjs/testing';
import { CACHE_MANAGER } from '@nestjs/cache-manager';

import { PrismaService } from '@providers/db/prisma/services';

import { MembersRepository } from './members.repository';

describe('MembersRepository', () => {
  let service: MembersRepository;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [MembersRepository, { provide: PrismaService, useValue: {} }],
    }).compile();

    service = module.get<MembersRepository>(MembersRepository);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
