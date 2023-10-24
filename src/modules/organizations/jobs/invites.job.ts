import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';

import { InvitationsService } from '../services';

@Injectable()
export class InviteJob {
  private readonly logger = new Logger(InviteJob.name);

  constructor(private readonly invitesService: InvitationsService) {}

  @Cron('*/1 * * * *')
  async expireInvites() {
    this.logger.log('Running cron job to expire invites');
    const expiredInvites = await this.invitesService.findAllToExpire();

    this.logger.log(`Found ${expiredInvites.length} invites to expire`);

    await Promise.all(
      expiredInvites.map(async (invite) => {
        await this.invitesService.expireInvite({
          id: invite.id,
          expiredBy: {
            service: 'InviteJob',
            serviceDetails: 'Cron job to expire invites',
          },
        });
      }),
    );
  }
}
