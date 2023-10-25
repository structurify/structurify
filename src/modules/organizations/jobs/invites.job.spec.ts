import { Test, TestingModule } from '@nestjs/testing';

import { InviteJob } from './invites.job';
import { InvitesService } from '../services';

describe('InviteJob', () => {
  let service: InviteJob;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [InviteJob, { provide: InvitesService, useValue: {} }],
    }).compile();

    service = module.get<InviteJob>(InviteJob);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
