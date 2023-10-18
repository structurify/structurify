import { GenericEvent } from '@contracts/events';
import { Member } from '@prisma/client';

export class MemberDeletedEvent extends GenericEvent<Member> {}
