import { Field, ObjectType, registerEnumType } from '@nestjs/graphql';
import { MemberRole } from '@prisma/client';

import { BaseModel } from '@contracts/common/models';

@ObjectType({ description: 'Member' })
export class Member extends BaseModel {
  @Field((_) => String)
  public userId: string;

  @Field((_) => String)
  public organizationId: string;

  @Field((_) => MemberRole)
  public role: MemberRole;
}

registerEnumType(MemberRole, {
  name: 'MemberRole',
});
