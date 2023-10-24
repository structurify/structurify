import { Module, Global } from '@nestjs/common';

import { SearchService } from './services';
import { EventListener } from './listeners';

@Global()
@Module({
  providers: [SearchService, EventListener],
  exports: [SearchService],
})
export class SearchModule {}
