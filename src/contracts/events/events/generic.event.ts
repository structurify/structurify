import { EventAction } from '../enums';

export class GenericEvent<T = any> {
  before?: T;
  after?: T;
  action: EventAction;
  entity: string;
  entityId: string;
  timestamp: Date;
}
