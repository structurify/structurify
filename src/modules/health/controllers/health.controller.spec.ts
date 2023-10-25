import {
  HealthCheckService,
  HealthIndicatorFunction,
  MemoryHealthIndicator,
  PrismaHealthIndicator,
} from '@nestjs/terminus';
import { Test, TestingModule } from '@nestjs/testing';
import { createMock } from 'ts-auto-mock';

import { PrismaService } from '@providers/db/prisma/services/prisma.service';

import { HealthController } from './health.controller';

describe('HealthController', () => {
  let controller: HealthController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [HealthController],
      providers: [{ provide: PrismaService, useValue: {} }],
    })
      .useMocker((token) => {
        const getStatus = (key: string) => ({ [key]: { status: 'up' } });

        if (Object.is(token, HealthCheckService)) {
          return createMock<HealthCheckService>({
            check: jest
              .fn()
              .mockImplementation((indicators: HealthIndicatorFunction[]) =>
                Promise.all(indicators.map((indicator) => indicator())),
              ),
          });
        }

        if (Object.is(token, PrismaHealthIndicator)) {
          return createMock<PrismaHealthIndicator>({
            pingCheck: jest.fn().mockImplementation(getStatus),
          });
        }

        if (Object.is(token, MemoryHealthIndicator)) {
          return createMock<MemoryHealthIndicator>({
            checkHeap: jest.fn().mockImplementation(getStatus),
            checkRSS: jest.fn().mockImplementation(getStatus),
          });
        }
      })
      .compile();

    controller = module.get<HealthController>(HealthController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should check health', async () => {
    await expect(controller.check()).resolves.toMatchInlineSnapshot(`
      [
        {
          "prisma": {
            "status": "up",
          },
        },
        {
          "mem_rss": {
            "status": "up",
          },
        },
      ]
    `);
  });
});
