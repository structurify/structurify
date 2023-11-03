import { Type } from 'class-transformer';
import { IsNotEmpty, IsOptional, IsString, IsUUID } from 'class-validator';
import { ServiceRoleInput } from '@contracts/common';
import { Prisma } from '@prisma/client';

export class CreateApiKeyDto {
  @IsString()
  @IsOptional()
  public name?: string;

  @IsUUID(4)
  @IsNotEmpty()
  public projectId: string;

  @IsNotEmpty()
  @Type(() => ServiceRoleInput)
  public createdBy: Prisma.InputJsonObject;
}
