import { Field, ObjectType } from '@nestjs/graphql';

@ObjectType({ description: 'Forgot password response' })
export class ForgotPasswordResponse {
  @Field((_) => Boolean)
  public success: boolean;
}
