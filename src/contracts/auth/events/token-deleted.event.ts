import { GenericEvent } from '@contracts/events';
import { Token } from '@prisma/client';

export class TokenDeletedEvent extends GenericEvent<Token> {}
