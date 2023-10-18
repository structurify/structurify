import { Field, ObjectType } from '@nestjs/graphql';
import { JSONResolver } from 'graphql-scalars';
import { Prisma } from '@prisma/client';
import { BaseModel } from '@contracts/common/models';

@ObjectType({ description: 'Organization' })
export class Organization extends BaseModel {
  @Field((_) => String)
  public name: string;

  @Field((_) => String)
  public slug: string;

  @Field((_) => JSONResolver, { nullable: true })
  public metadata?: Prisma.InputJsonObject;
}
