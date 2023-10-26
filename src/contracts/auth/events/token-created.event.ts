import { GenericEvent } from '@contracts/events';
import { Token } from '@prisma/client';

export class TokenCreatedEvent extends GenericEvent<Token> {}
