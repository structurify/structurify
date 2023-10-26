import { Field, ObjectType } from '@nestjs/graphql';

@ObjectType({ description: 'Sign out response' })
export class SignOutResponse {
  @Field((_) => Boolean)
  public success: boolean;
}
