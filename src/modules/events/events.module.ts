import { Module, Global } from '@nestjs/common';

import { EventsService } from './services';

@Global()
@Module({
  providers: [EventsService],
  exports: [EventsService],
})
export class EventsModule {}
