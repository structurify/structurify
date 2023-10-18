import { Field, InputType } from '@nestjs/graphql';
import { IsString, MinLength, IsNotEmpty } from 'class-validator';

@InputType()
export class SignInInput {
  @Field((_) => String)
  @IsString()
  @IsNotEmpty()
  public username: string;

  @Field((_) => String)
  @MinLength(16)
  @IsNotEmpty()
  public password: string;
}
