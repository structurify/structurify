import { Type } from 'class-transformer';
import {
  IsNotEmpty,
  IsOptional,
  IsEnum,
  IsString,
  IsUUID,
} from 'class-validator';
import { ServiceRoleInput } from '@contracts/common';
import { Prisma, ProjectStatus } from '@prisma/client';

export class UpdateProjectDto {
  @IsUUID(4)
  @IsNotEmpty()
  public id: string;

  @IsString()
  @IsOptional()
  public name?: string;

  @IsUUID(4)
  @IsOptional()
  public organizationId?: string;

  @IsOptional()
  @IsEnum(ProjectStatus)
  public status?: ProjectStatus;

  @IsNotEmpty()
  @Type(() => ServiceRoleInput)
  public updatedBy: Prisma.InputJsonObject;
}
