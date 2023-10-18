import { GenericEvent } from '@contracts/events';
import { Organization } from '@prisma/client';

export class OrganizationDeletedEvent extends GenericEvent<Organization> {}
