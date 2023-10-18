import { Field, InputType } from '@nestjs/graphql';
import { IsNotEmpty, IsOptional, IsEnum, IsUUID } from 'class-validator';
import { MemberRole } from '@prisma/client';

@InputType()
export class UpdateMemberInput {
  @Field((_) => String)
  @IsUUID(4)
  @IsNotEmpty()
  public userId: string;

  @Field((_) => String)
  @IsUUID(4)
  @IsNotEmpty()
  public organizationId: string;

  @Field((_) => MemberRole, { nullable: true })
  @IsOptional()
  @IsEnum(MemberRole)
  public role?: MemberRole;
}
