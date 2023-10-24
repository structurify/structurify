import { PaginationArgs } from '@contracts/common';
import { ArgsType, Field, ID } from '@nestjs/graphql';
import { IsUUID } from 'class-validator';

@ArgsType()
export class InvitationsArgs extends PaginationArgs {
  @Field((_) => ID)
  @IsUUID(4)
  public organizationId: string;
}
