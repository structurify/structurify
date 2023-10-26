import {
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
  MinLength,
} from 'class-validator';
import { ServiceRoleInput } from '@contracts/common';
import { Prisma } from '@prisma/client';
import { Type } from 'class-transformer';

export class UpdatePasswordDto {
  @IsUUID(4)
  @IsNotEmpty()
  public userId: string;

  @IsString()
  @MinLength(16)
  @IsOptional()
  public currentPassword?: string;

  @IsString()
  @MinLength(16)
  @IsNotEmpty()
  public newPassword: string;

  @IsString()
  @MinLength(16)
  @IsNotEmpty()
  public confirmPassword: string;

  @IsNotEmpty()
  @Type(() => ServiceRoleInput)
  public updatedBy: Prisma.InputJsonObject;
}
