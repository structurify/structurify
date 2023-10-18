import { ObjectType } from '@nestjs/graphql';
import { pagination } from '@shared/objects/pagination.object';

import { Invite } from './invite.model';

@ObjectType({ description: 'Invites' })
export class InvitesResponse extends pagination<Invite>(Invite) {}
