import { GenericEvent } from '@contracts/events';
import { Token } from '@prisma/client';

export class TokenUpdatedEvent extends GenericEvent<Token> {}
