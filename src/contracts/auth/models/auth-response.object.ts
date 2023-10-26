import { Field, ObjectType } from '@nestjs/graphql';

@ObjectType({ description: 'Auth response' })
export class AuthResponse {
  @Field((_) => String)
  public accessToken: string;

  @Field((_) => String)
  public refreshToken: string;

  @Field((_) => String)
  public refreshTokenId: string;
}
