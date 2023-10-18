import { Field, Int, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class PageMeta {
  @Field((_) => Int, { defaultValue: 0 })
  public count: number;

  @Field((_) => Int)
  public take: number;

  @Field((_) => Int)
  public skip: number;
}
