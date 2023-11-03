import { Field, ObjectType, registerEnumType } from '@nestjs/graphql';

import { BaseModel } from '@contracts/common/models';

@ObjectType({ description: 'ApiKey' })
export class ApiKey extends BaseModel {
  @Field((_) => String)
  public projectId: string;

  @Field((_) => String, { nullable: true })
  public name: string;

  @Field((_) => Date, { nullable: true })
  public expiresAt?: Date;

  @Field((_) => String)
  public accessKey: string;

  @Field((_) => String)
  public secretKey: string;
}
