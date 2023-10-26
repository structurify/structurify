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

export class CreateTokenDto {
  @IsUUID(4)
  @IsNotEmpty()
  public userId: string;

  @IsString()
  @IsNotEmpty()
  public refreshToken: string;

  @IsDate()
  @IsNotEmpty()
  public expiresAt: Date;

  @IsObject()
  @IsNotEmpty()
  @Type(() => ServiceRoleInput)
  public createdBy: Prisma.InputJsonObject;
}
