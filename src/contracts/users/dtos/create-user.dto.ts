import { Type } from 'class-transformer';
import {
  IsOptional,
  IsEmail,
  MinLength,
  IsNotEmpty,
  IsString,
} from 'class-validator';
import { ServiceRoleInput } from '@contracts/common';
import { Prisma } from '@prisma/client';

export class CreateUserDto {
  @IsString()
  @IsOptional()
  public firstName?: string | null;

  @IsString()
  @IsOptional()
  public lastName?: string | null;

  @IsEmail()
  @IsNotEmpty()
  public email: string;

  @IsString()
  @IsNotEmpty()
  public username: string;

  @IsString()
  @MinLength(16)
  @IsNotEmpty()
  public password: string;

  @IsNotEmpty()
  @Type(() => ServiceRoleInput)
  public createdBy: Prisma.InputJsonObject;
}
