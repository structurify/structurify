import { Field, ObjectType } from '@nestjs/graphql';

@ObjectType({ description: 'Sign in response' })
export class SignInResponse {
  @Field((_) => String)
  public accessToken: string;
}
