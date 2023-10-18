import { Field, ObjectType, registerEnumType } from '@nestjs/graphql';
import { InviteStatus, MemberRole } from '@prisma/client';

import { BaseModel } from '@contracts/common/models';

@ObjectType({ description: 'Invite' })
export class Invite extends BaseModel {
  @Field((_) => String)
  public organizationId: string;

  @Field((_) => String)
  public email: string;

  @Field((_) => String)
  public token: string;

  @Field((_) => InviteStatus)
  public status: InviteStatus;

  @Field((_) => MemberRole)
  public role: MemberRole;

  @Field((_) => Date)
  public expiresAt: Date;
}

registerEnumType(InviteStatus, {
  name: 'InviteStatus',
});
