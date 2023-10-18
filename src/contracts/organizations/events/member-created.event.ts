import { GenericEvent } from '@contracts/events';
import { Member } from '@prisma/client';

export class MemberCreatedEvent extends GenericEvent<Member> {}
