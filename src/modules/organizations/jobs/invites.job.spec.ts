import { Test, TestingModule } from '@nestjs/testing';
import { InviteJob } from './invites.job';

describe('InviteJob', () => {
  let service: InviteJob;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [InviteJob],
    }).compile();

    service = module.get<InviteJob>(InviteJob);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
