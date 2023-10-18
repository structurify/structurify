import { Field, ObjectType } from '@nestjs/graphql';

import { BaseModel } from '@contracts/common/models';

@ObjectType({ description: 'User' })
export class User extends BaseModel {
  @Field((_) => String, { nullable: true })
  public firstName?: string | null;

  @Field((_) => String, { nullable: true })
  public lastName?: string | null;

  @Field((_) => String)
  public email: string;

  @Field((_) => String)
  public username: string;
}
