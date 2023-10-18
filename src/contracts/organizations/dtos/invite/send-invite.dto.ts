import { Type } from 'class-transformer';
import {
  IsNotEmpty,
  IsOptional,
  IsEmail,
  IsUUID,
  IsEnum,
} from 'class-validator';
import { ServiceRoleInput } from '@contracts/common';
import { Prisma, MemberRole } from '@prisma/client';

export class SendInviteDto {
  @IsEmail()
  @IsNotEmpty()
  public email: string;

  @IsUUID(4)
  @IsNotEmpty()
  public organizationId: string;

  @IsEnum(MemberRole)
  @IsNotEmpty()
  public role: MemberRole;

  @IsNotEmpty()
  @Type(() => ServiceRoleInput)
  public createdBy: Prisma.InputJsonObject;

  @IsOptional()
  public metadata?: Prisma.InputJsonObject;
}
