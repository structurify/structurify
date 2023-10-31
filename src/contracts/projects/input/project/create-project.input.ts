import { Field, InputType } from '@nestjs/graphql';
import { Prisma } from '@prisma/client';
import { IsNotEmpty, IsOptional, IsString, IsUUID } from 'class-validator';
import { JSONResolver } from 'graphql-scalars';

@InputType()
export class CreateProjectInput {
  @Field((_) => String)
  @IsString()
  @IsNotEmpty()
  public name: string;

  @Field((_) => String)
  @IsUUID(4)
  @IsNotEmpty()
  public organizationId: string;

  @Field((_) => JSONResolver, { nullable: true })
  @IsOptional()
  public metadata?: Prisma.InputJsonObject;
}
