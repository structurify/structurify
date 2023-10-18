import { Test, TestingModule } from '@nestjs/testing';
import { UserListener } from './user.listener';

describe('UserListener', () => {
  let service: UserListener;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [UserListener],
    }).compile();

    service = module.get<UserListener>(UserListener);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
