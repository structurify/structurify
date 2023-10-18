import { Field, InputType } from '@nestjs/graphql';
import { IsNotEmpty, IsUUID, IsString } from 'class-validator';

@InputType()
export class AcceptInviteInput {
  @Field((_) => String)
  @IsString()
  @IsNotEmpty()
  public token: string;

  @Field((_) => String)
  @IsUUID(4)
  @IsNotEmpty()
  public slug: string;
}
