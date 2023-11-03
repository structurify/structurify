import { ObjectType } from '@nestjs/graphql';
import { pagination } from '@shared/objects/pagination.object';

import { ApiKey } from './api-key.model';

@ObjectType({ description: 'ApiKeys' })
export class ApiKeysResponse extends pagination<ApiKey>(ApiKey) {}
