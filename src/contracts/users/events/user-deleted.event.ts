import { GenericEvent } from '@contracts/events';
import { User } from '@prisma/client';

export class UserDeletedEvent extends GenericEvent<User> {}
