import { ObjectType } from '@nestjs/graphql';
import { pagination } from '@shared/objects/pagination.object';

import { Member } from './member.model';

@ObjectType({ description: 'Members' })
export class MembersResponse extends pagination<Member>(Member) {}
