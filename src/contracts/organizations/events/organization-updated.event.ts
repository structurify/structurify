import { GenericEvent } from '@contracts/events';
import { Organization } from '@prisma/client';

export class OrganizationUpdatedEvent extends GenericEvent<Organization> {}
