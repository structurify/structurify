import { Field, ID, ObjectType } from '@nestjs/graphql';

@ObjectType({ description: 'Service role' })
export class ServiceRole {
  @Field((_) => ID, { nullable: true })
  public userId: string;

  @Field((_) => String, { nullable: true })
  public service: string;

  @Field((_) => String, { nullable: true })
  public serviceDescription: string;
}
