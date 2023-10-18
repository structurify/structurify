import { ObjectType } from '@nestjs/graphql';
import { pagination } from '@shared/objects/pagination.object';

import { Organization } from './organization.model';

@ObjectType({ description: 'Organizations' })
export class OrganizationsResponse extends pagination<Organization>(
  Organization,
) {}
