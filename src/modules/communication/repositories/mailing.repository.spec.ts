import { Test, TestingModule } from '@nestjs/testing';
import { MailingRepository } from './mailing.repository';

describe('MailingRepository', () => {
  let service: MailingRepository;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [MailingRepository],
    }).compile();

    service = module.get<MailingRepository>(MailingRepository);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
