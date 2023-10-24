import { Test, TestingModule } from '@nestjs/testing';
import { DataLakeStorageService } from './data-lake-storage.service';

describe('DataLakeStorageService', () => {
  let service: DataLakeStorageService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [DataLakeStorageService],
    }).compile();

    service = module.get<DataLakeStorageService>(DataLakeStorageService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
