import { GenericEvent } from '@contracts/events';
import { Invite } from '@prisma/client';

export class InviteResendedEvent extends GenericEvent<Invite> {}
