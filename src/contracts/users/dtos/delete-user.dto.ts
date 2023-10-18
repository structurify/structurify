import { ServiceRoleInput } from '@contracts/common';
import { IsNotEmpty, IsString } from 'class-validator';
import { Type } from 'class-transformer';
import { Prisma } from '@prisma/client';

export class DeleteUserDto {
  @IsString()
  @IsNotEmpty()
  public id: string;

  @IsNotEmpty()
  @Type(() => ServiceRoleInput)
  public deletedBy: Prisma.InputJsonObject;
}
