import { Field, ID, InputType } from '@nestjs/graphql';
import { IsNotEmpty, ValidateIf } from 'class-validator';

@InputType()
export class ServiceRoleInput {
  @Field((_) => ID, { nullable: true })
  @ValidateIf((o) => !o.service && !o.serviceDescription)
  @IsNotEmpty()
  public userId: string;

  @Field((_) => String, { nullable: true })
  @ValidateIf((o) => !o.userId)
  @IsNotEmpty()
  public service: string;

  @Field((_) => String, { nullable: true })
  @ValidateIf((o) => !o.userId)
  @IsNotEmpty()
  public serviceDescription?: string;
}
