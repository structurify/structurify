import { Type } from 'class-transformer';
import {
  IsNotEmpty,
  IsUUID,
  IsOptional,
  IsObject,
  IsEnum,
} from 'class-validator';
import { ServiceRoleInput } from '@contracts/common';
import { Prisma, MemberRole } from '@prisma/client';

export class CreateMemberDto {
  @IsUUID(4)
  @IsNotEmpty()
  public userId: string;

  @IsUUID(4)
  @IsNotEmpty()
  public organizationId: string;

  @IsEnum(MemberRole)
  @IsNotEmpty()
  public role: MemberRole;

  @IsObject()
  @IsOptional()
  public metadata?: Prisma.InputJsonObject;

  @IsNotEmpty()
  @Type(() => ServiceRoleInput)
  public createdBy: Prisma.InputJsonObject;
}
