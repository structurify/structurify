import { Field, InputType } from '@nestjs/graphql';
import { IsNotEmpty, IsString, IsUUID, MinLength } from 'class-validator';

@InputType()
export class ResetPasswordInput {
  @Field((_) => String)
  @IsUUID(4)
  @IsNotEmpty()
  public userId: string;

  @Field((_) => String)
  @IsString()
  @IsNotEmpty()
  public token: string;

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
