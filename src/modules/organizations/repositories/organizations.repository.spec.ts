import { Test, TestingModule } from '@nestjs/testing';
import { CACHE_MANAGER } from '@nestjs/cache-manager';

import { PrismaService } from '@providers/db/prisma/services';

import { OrganizationsRepository } from './organizations.repository';

describe('OrganizationsRepository', () => {
  let service: OrganizationsRepository;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        OrganizationsRepository,
        { provide: PrismaService, useValue: {} },
      ],
    }).compile();

    service = module.get<OrganizationsRepository>(OrganizationsRepository);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
