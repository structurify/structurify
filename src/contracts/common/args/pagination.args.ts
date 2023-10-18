import { ArgsType, Field, Int } from '@nestjs/graphql';
import { Max, Min } from 'class-validator';

@ArgsType()
export class PaginationArgs {
  @Field((_) => Int, { defaultValue: 0 })
  @Min(0)
  public skip = 0;

  @Field((_) => Int, { defaultValue: 10 })
  @Min(1)
  @Max(100)
  public take = 10;
}
