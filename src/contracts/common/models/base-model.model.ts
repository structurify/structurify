import { Field, ID, ObjectType } from '@nestjs/graphql';

import { ServiceRole } from './service-role.model';
import { Prisma } from '@prisma/client';

@ObjectType({ description: 'Base model' })
export class BaseModel {
  @Field((_) => ID)
  public id: string;

  @Field((_) => Date)
  public createdAt: string;

  @Field((_) => ServiceRole)
  public createdBy: Prisma.InputJsonObject;

  @Field((_) => Date)
  public updatedAt: string;

  @Field((_) => ServiceRole)
  public updatedBy: Prisma.InputJsonObject;

  @Field((_) => Date, { nullable: true })
  public deletedAt: string;

  @Field((_) => ServiceRole, { nullable: true })
  public deletedBy: Prisma.InputJsonObject;
}
