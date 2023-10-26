import { ServiceRoleInput } from '@contracts/common';
import { Prisma } from '@prisma/client';
import { Type } from 'class-transformer';
import { IsOptional, IsNotEmpty, IsString, IsDate } from 'class-validator';

export class UpdateUserDto {
  @IsString()
  @IsNotEmpty()
  public id: string;

  @IsString()
  @IsOptional()
  public firstName?: string | null;

  @IsString()
  @IsOptional()
  public lastName?: string | null;

  @IsString()
  @IsOptional()
  public resetToken?: string | null;

  @IsDate()
  @IsOptional()
  public resetTokenExpiresAt?: Date | null;

  @IsNotEmpty()
  @Type(() => ServiceRoleInput)
  public updatedBy: Prisma.InputJsonObject;
}
