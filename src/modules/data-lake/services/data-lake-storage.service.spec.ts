import { Test, TestingModule } from '@nestjs/testing';
import { DataLakeStorageService } from './data-lake-storage.service';
import { MinioService } from 'nestjs-minio-client';

describe('DataLakeStorageService', () => {
  let service: DataLakeStorageService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DataLakeStorageService,
        {
          provide: MinioService,
          useValue: {},
        },
      ],
    }).compile();

    service = module.get<DataLakeStorageService>(DataLakeStorageService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
