import { GenericEvent } from '@contracts/events';
import { User } from '@prisma/client';

export class UserCreatedEvent extends GenericEvent<User> {}
