import { Test, TestingModule } from '@nestjs/testing';
import { I18nService } from 'nestjs-i18n';

import { MailingRepository } from '@app/modules/communication/services';

import { UserListener } from './user.listener';

describe('UserListener', () => {
  let service: UserListener;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserListener,
        { provide: MailingRepository, useValue: {} },
        { provide: I18nService, useValue: {} },
      ],
    }).compile();

    service = module.get<UserListener>(UserListener);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
