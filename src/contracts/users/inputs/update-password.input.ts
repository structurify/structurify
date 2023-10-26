import { Field, InputType } from '@nestjs/graphql';
import { IsNotEmpty, IsString, MinLength } from 'class-validator';

@InputType()
export class UpdatePasswordInput {
  @Field((_) => String)
  @IsString()
  @MinLength(16)
  @IsNotEmpty()
  public currentPassword: string;

  @Field((_) => String)
  @IsString()
  @MinLength(16)
  @IsNotEmpty()
  public newPassword: string;

  @Field((_) => String)
  @IsString()
  @MinLength(16)
  @IsNotEmpty()
  public confirmPassword: string;
}
