import { Type } from 'class-transformer';
import { IsNotEmpty, IsOptional, IsString, IsUUID } from 'class-validator';
import { ServiceRoleInput } from '@contracts/common';
import { Prisma } from '@prisma/client';

export class UpdateOrganizationDto {
  @IsUUID(4)
  @IsNotEmpty()
  public id: string;

  @IsString()
  @IsOptional()
  public name?: string;

  @Type(() => ServiceRoleInput)
  @IsNotEmpty()
  public updatedBy: Prisma.InputJsonObject;
}
