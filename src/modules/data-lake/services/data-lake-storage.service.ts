import { Injectable, Logger } from '@nestjs/common';
import { MinioService } from 'nestjs-minio-client';

import { GenericEvent } from '@contracts/events';

@Injectable()
export class DataLakeStorageService {
  private readonly logger = new Logger(DataLakeStorageService.name);
  private BUCKET_REGION = 'us-east-1';
  private BUCKET_NAME = 'data-lake';

  constructor(private readonly minioService: MinioService) {}

  async storeBronzeTier<T = any>(event: GenericEvent<T>) {
    await this.prepareBucket(this.BUCKET_NAME);

    const path = `bronze-tier/${event.entity}/${event.entityId}/${new Date(
      event.timestamp,
    ).toISOString()}-${event.action}.json`;

    const buf = Buffer.from(JSON.stringify(event, null, 2));

    await this.minioService.client.putObject(
      this.BUCKET_NAME,
      path,
      buf,
      buf.length,
      {
        'Content-Type': 'application/json',
      },
    );
  }

  private async prepareBucket(bucketName: string): Promise<void> {
    const bucketExists =
      await this.minioService.client.bucketExists(bucketName);

    if (!bucketExists) {
      await this.minioService.client.makeBucket(bucketName, this.BUCKET_REGION);
    }
  }
}
