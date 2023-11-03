import { Field, InputType } from '@nestjs/graphql';
import { Prisma } from '@prisma/client';
import {
  IsDate,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
} from 'class-validator';
import { JSONResolver } from 'graphql-scalars';

@InputType()
export class CreateApiKeyInput {
  @Field((_) => String, { nullable: true })
  @IsString()
  @IsOptional()
  public name?: string;

  @Field((_) => String)
  @IsUUID(4)
  @IsNotEmpty()
  public projectId: string;

  @Field((_) => Date, { nullable: true })
  @IsDate()
  @IsOptional()
  public expiresAt?: Date;

  @Field((_) => JSONResolver, { nullable: true })
  @IsOptional()
  public metadata?: Prisma.InputJsonObject;
}
