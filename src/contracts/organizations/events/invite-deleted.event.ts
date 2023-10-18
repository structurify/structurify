import { GenericEvent } from '@contracts/events';
import { Invite } from '@prisma/client';

export class InviteDeletedEvent extends GenericEvent<Invite> {}
