import { Type } from 'class-transformer';
import { IsNotEmpty, IsString } from 'class-validator';
import { ServiceRoleInput } from '@contracts/common';
import { Prisma } from '@prisma/client';

export class AcceptInviteDto {
  @IsString()
  @IsNotEmpty()
  public token: string;

  @IsNotEmpty()
  @Type(() => ServiceRoleInput)
  public updatedBy: Prisma.InputJsonObject;
}
