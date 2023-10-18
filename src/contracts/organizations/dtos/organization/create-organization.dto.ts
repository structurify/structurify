import { Type } from 'class-transformer';
import { IsNotEmpty, IsString, IsOptional, IsObject } from 'class-validator';
import { ServiceRoleInput } from '@contracts/common';
import { Prisma } from '@prisma/client';

export class CreateOrganizationDto {
  @IsString()
  @IsNotEmpty()
  public name: string;

  @Type(() => ServiceRoleInput)
  @IsNotEmpty()
  public createdBy: Prisma.InputJsonObject;

  @IsObject()
  @IsOptional()
  public metadata?: Prisma.InputJsonObject;
}
