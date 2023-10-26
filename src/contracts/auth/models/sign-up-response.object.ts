import { Field, ObjectType } from '@nestjs/graphql';

@ObjectType({ description: 'Sign up response' })
export class SignUpResponse {
  @Field((_) => String)
  public accessToken: string;

  @Field((_) => String)
  public refreshToken: string;

  @Field((_) => String)
  public refreshTokenId: string;
}
