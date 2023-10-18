import { Field, InputType } from '@nestjs/graphql';
import { IsEmail, MinLength, IsNotEmpty, IsString } from 'class-validator';

@InputType()
export class SignUpInput {
  @Field((_) => String)
  @IsString()
  @IsNotEmpty()
  public username: string;

  @Field((_) => String)
  @IsEmail()
  @IsNotEmpty()
  public email: string;

  @Field((_) => String)
  @MinLength(16)
  @IsNotEmpty()
  public password: string;
}
