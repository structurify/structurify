import { Test, TestingModule } from '@nestjs/testing';
import { CACHE_MANAGER } from '@nestjs/cache-manager';

import { PrismaService } from '@providers/db/prisma/services';

import { InvitesRepository } from './invites.repository';

describe('InvitesRepository', () => {
  let service: InvitesRepository;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [InvitesRepository, { provide: PrismaService, useValue: {} }],
    }).compile();

    service = module.get<InvitesRepository>(InvitesRepository);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
