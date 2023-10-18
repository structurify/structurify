import { Type } from 'class-transformer';
import { IsNotEmpty, IsOptional, IsEnum, IsUUID } from 'class-validator';
import { ServiceRoleInput } from '@contracts/common';
import { Prisma, MemberRole } from '@prisma/client';

export class UpdateMemberDto {
  @IsUUID(4)
  @IsNotEmpty()
  public userId: string;

  @IsUUID(4)
  @IsNotEmpty()
  public organizationId: string;

  @IsOptional()
  @IsEnum(MemberRole)
  public role?: MemberRole;

  @IsNotEmpty()
  @Type(() => ServiceRoleInput)
  public updatedBy: Prisma.InputJsonObject;
}
