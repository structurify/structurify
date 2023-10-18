import { GenericEvent } from '@contracts/events';
import { Organization } from '@prisma/client';

export class OrganizationCreatedEvent extends GenericEvent<Organization> {}
