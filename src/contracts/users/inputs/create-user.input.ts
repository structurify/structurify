import { Field, InputType } from '@nestjs/graphql';
import {
  IsOptional,
  IsEmail,
  MinLength,
  IsNotEmpty,
  IsString,
} from 'class-validator';

@InputType()
export class CreateUserInput {
  @Field((_) => String, { nullable: true })
  @IsString()
  @IsOptional()
  public firstName?: string | null;

  @Field((_) => String, { nullable: true })
  @IsString()
  @IsOptional()
  public lastName?: string | null;

  @Field((_) => String)
  @IsEmail()
  @IsNotEmpty()
  public email: string;

  @Field((_) => String)
  @IsString()
  @IsNotEmpty()
  public username: string;

  @Field((_) => String)
  @IsString()
  @MinLength(16)
  @IsNotEmpty()
  public password: string;
}
