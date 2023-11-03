import { Type } from 'class-transformer';
import {
  IsNotEmpty,
  IsOptional,
  IsEnum,
  IsString,
  IsUUID,
} from 'class-validator';
import { ServiceRoleInput } from '@contracts/common';
import { Prisma } from '@prisma/client';

export class UpdateApiKeyDto {
  @IsUUID(4)
  @IsNotEmpty()
  public id: string;

  @IsString()
  @IsOptional()
  public name?: string;

  @IsNotEmpty()
  @Type(() => ServiceRoleInput)
  public updatedBy: Prisma.InputJsonObject;
}
