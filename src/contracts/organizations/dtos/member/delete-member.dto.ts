import { Type } from 'class-transformer';
import { IsNotEmpty, IsUUID } from 'class-validator';
import { ServiceRoleInput } from '@contracts/common';
import { Prisma } from '@prisma/client';

export class DeleteMemberDto {
  @IsUUID(4)
  @IsNotEmpty()
  public userId: string;

  @IsUUID(4)
  @IsNotEmpty()
  public organizationId: string;

  @IsNotEmpty()
  @Type(() => ServiceRoleInput)
  public deletedBy: Prisma.InputJsonObject;
}
