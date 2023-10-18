import { GenericEvent } from '@contracts/events';
import { User } from '@prisma/client';

export class UserUpdatedEvent extends GenericEvent<User> {}
