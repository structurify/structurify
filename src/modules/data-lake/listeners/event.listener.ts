import { Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';

import { GenericEvent } from '@contracts/events';
import { DataLakeStorageService } from '../services';

@Injectable()
export class EventListener {
  private readonly logger = new Logger(EventListener.name);

  constructor(
    private readonly dataLakeStorageService: DataLakeStorageService,
  ) {}

  @OnEvent('**')
  async handleAllEvents(event: GenericEvent<any>) {
    this.logger.debug(`Received event:`, JSON.stringify(event, null, 2));
    await this.dataLakeStorageService.storeBronzeTier(event);
  }
}
