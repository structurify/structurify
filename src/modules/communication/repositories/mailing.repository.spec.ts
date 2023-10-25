import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { MailerService } from '@nestjs-modules/mailer';

import { MailingRepository } from './mailing.repository';

describe('MailingRepository', () => {
  let service: MailingRepository;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MailingRepository,
        {
          provide: ConfigService,
          useValue: {},
        },
        {
          provide: MailerService,
          useValue: {},
        },
      ],
    }).compile();

    service = module.get<MailingRepository>(MailingRepository);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
