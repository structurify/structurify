import { Field, InputType, ID } from '@nestjs/graphql';
import { IsNotEmpty, IsString } from 'class-validator';

@InputType()
export class DeleteUserInput {
  @Field((_) => ID)
  @IsString()
  @IsNotEmpty()
  public id: string;
}
