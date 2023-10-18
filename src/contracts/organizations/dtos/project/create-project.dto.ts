import { Type } from 'class-transformer';
import { IsNotEmpty, IsString, IsUUID } from 'class-validator';
import { ServiceRoleInput } from '@contracts/common';
import { Prisma } from '@prisma/client';

export class CreateProjectDto {
  @IsString()
  @IsNotEmpty()
  public name: string;

  @IsUUID(4)
  @IsNotEmpty()
  public organizationId: string;

  @IsNotEmpty()
  @Type(() => ServiceRoleInput)
  public createdBy: Prisma.InputJsonObject;
}
