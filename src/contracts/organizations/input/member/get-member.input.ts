import { Field, InputType } from '@nestjs/graphql';
import { IsNotEmpty, IsUUID } from 'class-validator';

@InputType()
export class GetMemberInput {
  @Field((_) => String)
  @IsUUID(4)
  @IsNotEmpty()
  public userId: string;

  @Field((_) => String)
  @IsUUID(4)
  @IsNotEmpty()
  public organizationId: string;
}
