import { Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';

import { UserCreatedEvent, UserEvents } from '@contracts/users';
import { OrganizationsService, MembersService } from '../services';
import { MemberRole } from '@prisma/client';

@Injectable()
export class UserListener {
  private readonly logger = new Logger(UserListener.name);

  constructor(
    private readonly organizationsService: OrganizationsService,
    private readonly membersService: MembersService,
  ) {}

  @OnEvent(UserEvents.USER_CREATED)
  async handleOrderCreatedEvent(event: UserCreatedEvent) {
    const name = `${event.after!.username}'s Org`;
    const organization = await this.organizationsService.create({
      name,
      createdBy: {
        service: 'organizations-module',
        serviceDetail: 'User created event',
      },
    });
    this.logger.debug(`Organization ${name} automatically created`);

    await this.membersService.create({
      userId: event.after!.id,
      organizationId: organization.id,
      role: MemberRole.OWNER,
      isOwner: true,
      createdBy: {
        service: 'organizations-module',
        serviceDetail: 'User created event',
      },
    });
    this.logger.debug(
      `Promoted ${event.after!.username} as ${MemberRole.OWNER} of ${name}`,
    );
  }
}
