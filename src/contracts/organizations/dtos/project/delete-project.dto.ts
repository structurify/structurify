import { Type } from 'class-transformer';
import { IsNotEmpty, IsUUID } from 'class-validator';
import { ServiceRoleInput } from '@contracts/common';
import { Prisma } from '@prisma/client';

export class DeleteProjectDto {
  @IsUUID(4)
  @IsNotEmpty()
  public id: string;

  @IsNotEmpty()
  @Type(() => ServiceRoleInput)
  public deletedBy: Prisma.InputJsonObject;
}
