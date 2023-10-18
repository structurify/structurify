import { Field, InputType } from '@nestjs/graphql';
import { IsNotEmpty, IsString, IsOptional } from 'class-validator';
import { Prisma } from '@prisma/client';
import { JSONResolver } from 'graphql-scalars';

@InputType()
export class CreateOrganizationInput {
  @Field((_) => String)
  @IsString()
  @IsNotEmpty()
  public name: string;

  @Field((_) => JSONResolver, { nullable: true })
  @IsOptional()
  public metadata?: Prisma.InputJsonObject;
}
