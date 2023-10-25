import { Test, TestingModule } from '@nestjs/testing';

import { UserListener } from './user.listener';
import { OrganizationsService, MembersService } from '../services';

describe('UserListener', () => {
  let service: UserListener;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserListener,
        { provide: OrganizationsService, useValue: {} },
        { provide: MembersService, useValue: {} },
      ],
    }).compile();

    service = module.get<UserListener>(UserListener);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
