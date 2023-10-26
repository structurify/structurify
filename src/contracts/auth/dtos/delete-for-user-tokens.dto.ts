import { Type } from 'class-transformer';
import {
  IsNotEmpty,
  IsString,
  IsObject,
  IsUUID,
  IsDate,
} from 'class-validator';
import { ServiceRoleInput } from '@contracts/common';
import { Prisma } from '@prisma/client';

export class DeleteForUsersTokensDto {
  @IsUUID(4)
  @IsNotEmpty()
  public userId: string;

  @IsObject()
  @IsNotEmpty()
  @Type(() => ServiceRoleInput)
  public deletedBy: Prisma.InputJsonObject;
}
