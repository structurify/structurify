import { Args, Mutation, Resolver, Context } from '@nestjs/graphql';
import {
  SignInInput,
  SignInResponse,
  SignUpInput,
  SignUpResponse,
} from '@contracts/auth';
import { Logger, UseGuards } from '@nestjs/common';

import { AuthService } from '../services';
import { GqlAuthGuard, JwtRefreshGuard } from '../guards';

@Resolver()
export class AuthResolver {
  private readonly logger = new Logger(AuthResolver.name);

  constructor(private readonly authService: AuthService) {}

  @UseGuards(GqlAuthGuard)
  @Mutation((_) => SignInResponse)
  async signIn(
    @Args('input') _input: SignInInput,
    @Context() context,
  ): Promise<SignInResponse> {
    return this.authService.signIn(context.user);
  }

  @UseGuards(JwtRefreshGuard)
  @Mutation((_) => SignInResponse)
  async refreshToken(@Context() context): Promise<SignInResponse> {
    return this.authService.refreshToken(
      context.req.user,
      context.req.user.token,
    );
  }

  @Mutation((_) => SignUpResponse)
  async signUp(@Args('input') input: SignUpInput): Promise<SignUpResponse> {
    return this.authService.signUp(input.email, input.password, input.username);
  }
}
