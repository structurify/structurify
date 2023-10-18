import { Type } from 'class-transformer';
import { IsNotEmpty, IsUUID } from 'class-validator';
import { ServiceRoleInput } from '@contracts/common';
import { Prisma } from '@prisma/client';

export class DeleteOrganizationDto {
  @IsUUID(4)
  @IsNotEmpty()
  public id: string;

  @Type(() => ServiceRoleInput)
  @IsNotEmpty()
  public deletedBy: Prisma.InputJsonObject;
}
