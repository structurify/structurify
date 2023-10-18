import { GenericEvent } from '@contracts/events';
import { Member } from '@prisma/client';

export class MemberUpdatedEvent extends GenericEvent<Member> {}
