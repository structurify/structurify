import { Field, InputType, ID } from '@nestjs/graphql';
import { IsNotEmpty, IsUUID } from 'class-validator';

@InputType()
export class TransferProjectInput {
  @Field((_) => ID)
  @IsUUID(4)
  @IsNotEmpty()
  public id: string;

  @Field((_) => String)
  @IsUUID(4)
  @IsNotEmpty()
  public newOrganizationId: string;
}
