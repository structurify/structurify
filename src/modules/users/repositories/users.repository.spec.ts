import { Test, TestingModule } from '@nestjs/testing';

import { PrismaService } from '@providers/db/prisma';

import { UsersRepository } from './users.repository';

describe('UsersRepository', () => {
  let service: UsersRepository;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [UsersRepository, { provide: PrismaService, useValue: {} }],
    }).compile();

    service = module.get<UsersRepository>(UsersRepository);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
