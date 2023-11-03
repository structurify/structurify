import { Test, TestingModule } from '@nestjs/testing';

import { ApiKeysRepository } from './api-keys.repository';
import { PrismaService } from '@providers/db/prisma/services';

describe('ApiKeysRepository', () => {
  let service: ApiKeysRepository;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ApiKeysRepository, { provide: PrismaService, useValue: {} }],
    }).compile();

    service = module.get<ApiKeysRepository>(ApiKeysRepository);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
