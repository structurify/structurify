import { GenericEvent } from '@contracts/events';
import { Invite } from '@prisma/client';

export class InviteUpdatedEvent extends GenericEvent<Invite> {}
