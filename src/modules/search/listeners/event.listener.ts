import { Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';

import { GenericEvent } from '@contracts/events';
import { SearchService } from '../services';

@Injectable()
export class EventListener {
  private readonly logger = new Logger(EventListener.name);

  constructor(private readonly searchService: SearchService) {}

  @OnEvent('**')
  async handleAllEvents(event: GenericEvent<any>) {
    await this.searchService.handleEvent(event);
  }
}
