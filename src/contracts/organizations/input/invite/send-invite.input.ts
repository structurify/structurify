import { Field, InputType } from '@nestjs/graphql';
import {
  IsNotEmpty,
  IsOptional,
  IsEmail,
  IsUUID,
  IsEnum,
} from 'class-validator';
import { Prisma, MemberRole } from '@prisma/client';
import { EmailAddressResolver, JSONResolver } from 'graphql-scalars';

@InputType()
export class SendInviteInput {
  @Field((_) => EmailAddressResolver)
  @IsEmail()
  @IsNotEmpty()
  public email: string;

  @Field((_) => String)
  @IsUUID(4)
  @IsNotEmpty()
  public organizationId: string;

  @Field((_) => MemberRole)
  @IsEnum(MemberRole)
  @IsNotEmpty()
  public role: MemberRole;

  @Field((_) => JSONResolver, { nullable: true })
  @IsOptional()
  public metadata?: Prisma.InputJsonObject;
}
