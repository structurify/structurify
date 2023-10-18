import { Field, InputType, ID } from '@nestjs/graphql';
import {
  IsNotEmpty,
  IsOptional,
  IsEnum,
  IsString,
  IsUUID,
} from 'class-validator';
import { Prisma, ProjectStatus } from '@prisma/client';
import { JSONResolver } from 'graphql-scalars';

@InputType()
export class UpdateProjectInput {
  @Field((_) => ID)
  @IsUUID(4)
  @IsNotEmpty()
  public id: string;

  @Field((_) => String, { nullable: true })
  @IsString()
  @IsOptional()
  public name?: string;

  @Field((_) => ProjectStatus, { nullable: true })
  @IsOptional()
  @IsEnum(ProjectStatus)
  public status?: ProjectStatus;

  @Field((_) => JSONResolver, { nullable: true })
  @IsOptional()
  public metadata?: Prisma.InputJsonObject;
}
