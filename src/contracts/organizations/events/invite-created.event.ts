import { GenericEvent } from '@contracts/events';
import { Invite } from '@prisma/client';

export class InviteCreatedEvent extends GenericEvent<Invite> {}
