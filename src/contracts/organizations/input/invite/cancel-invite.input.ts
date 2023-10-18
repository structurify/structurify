import { Field, InputType, ID } from '@nestjs/graphql';
import { IsNotEmpty, IsUUID } from 'class-validator';

@InputType()
export class CancelInviteInput {
  @Field((_) => ID)
  @IsUUID(4)
  @IsNotEmpty()
  public id: string;
}
