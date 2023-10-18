import { GenericEvent } from '@contracts/events';
import { Invite } from '@prisma/client';

export class InviteExpiredEvent extends GenericEvent<Invite> {}
