import type { Prisma } from '@prisma/client';

import type { PrismaModels } from '@contracts/common'

import { EventAction } from '../enums';

export class GenericEvent<T = PrismaModels> {
  before?: T;
  after?: T;
  action: EventAction;
  entity: Prisma.ModelName;
  entityId: string;
  timestamp: Date;
}
