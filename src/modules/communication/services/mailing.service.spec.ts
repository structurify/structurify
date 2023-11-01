import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { MailerService } from '@nestjs-modules/mailer';

import { MailingService } from './mailing.service';

describe('MailingService', () => {
  let service: MailingService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MailingService,
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

    service = module.get<MailingService>(MailingService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
