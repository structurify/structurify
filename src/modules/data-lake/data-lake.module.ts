import { Module, Global } from '@nestjs/common';

import { EventListener } from './listeners';
import { DataLakeStorageService } from './services';

@Global()
@Module({
  providers: [EventListener, DataLakeStorageService],
  exports: [],
})
export class DataLakeModule {}
