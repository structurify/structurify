import { Args, Mutation, Resolver, Context } from '@nestjs/graphql';
import { SignInInput, AuthResponse, SignUpInput } from '@contracts/auth';
import { Logger, UseGuards } from '@nestjs/common';

import { AuthService } from '../services';
import { GqlAuthGuard, JwtRefreshGuard, JwtAuthGuard } from '../guards';
import { User } from '@prisma/client';
import { CurrentUser } from '@decorators/current-user.decorator';

@Resolver()
export class AuthResolver {
  private readonly logger = new Logger(AuthResolver.name);

  constructor(private readonly authService: AuthService) {}

  @UseGuards(GqlAuthGuard)
  @Mutation((_) => AuthResponse)
  async signIn(
    @Args('input') _input: SignInInput,
    @Context() context,
  ): Promise<AuthResponse> {
    return this.authService.signIn(context.user);
  }

  @UseGuards(JwtRefreshGuard)
  @Mutation((_) => AuthResponse)
  async refreshToken(@CurrentUser() user: User): Promise<AuthResponse> {
    return this.authService.refreshToken(user, (user as any).token);
  }

  @UseGuards(JwtAuthGuard)
  @Mutation()
  async signOut(@CurrentUser() user: User): Promise<void> {
    await this.authService.signOut(user);
  }

  @Mutation((_) => SignUpResponse)
  async signUp(@Args('input') input: SignUpInput): Promise<SignUpResponse> {
  @Mutation((_) => AuthResponse)
  async signUp(@Args('input') input: SignUpInput): Promise<AuthResponse> {
    return this.authService.signUp(input.email, input.password, input.username);
  }
}
