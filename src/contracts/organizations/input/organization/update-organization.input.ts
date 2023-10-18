import { Field, InputType, ID } from '@nestjs/graphql';
import { Prisma } from '@prisma/client';
import { IsNotEmpty, IsOptional, IsString, IsUUID } from 'class-validator';
import { JSONResolver } from 'graphql-scalars';

@InputType()
export class UpdateOrganizationInput {
  @Field((_) => ID)
  @IsUUID(4)
  @IsNotEmpty()
  public id: string;

  @Field((_) => String, { nullable: true })
  @IsString()
  @IsOptional()
  public name?: string;

  @Field((_) => JSONResolver, { nullable: true })
  @IsOptional()
  public metadata?: Prisma.InputJsonObject;
}
