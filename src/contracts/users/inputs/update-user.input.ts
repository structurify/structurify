import { Field, InputType, ID } from '@nestjs/graphql';
import { IsOptional, IsNotEmpty, IsString } from 'class-validator';

@InputType()
export class UpdateUserInput {
  @Field((_) => ID)
  @IsString()
  @IsNotEmpty()
  public id: string;

  @Field((_) => String, { nullable: true })
  @IsString()
  @IsOptional()
  public firstName?: string | null;

  @Field((_) => String, { nullable: true })
  @IsString()
  @IsOptional()
  public lastName?: string | null;
}
