import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';

@Injectable()
export class InviteJob {
  private readonly logger = new Logger(InviteJob.name);

  @Cron('*/1 * * * *')
  expireInvites() {
    this.logger.debug('Called every minute');
  }
}
