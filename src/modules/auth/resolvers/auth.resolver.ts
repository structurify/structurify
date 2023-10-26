import { Args, Mutation, Resolver, Context } from '@nestjs/graphql';
import {
  SignInInput,
  AuthResponse,
  SignUpInput,
  SignOutResponse,
} from '@contracts/auth';
import { Logger, UseGuards } from '@nestjs/common';
import { User } from '@prisma/client';
import { CurrentUser } from '@decorators/current-user.decorator';

import { AuthService } from '../services';
import { GqlAuthGuard, JwtRefreshGuard, JwtAuthGuard } from '../guards';

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
  @Mutation(() => SignOutResponse)
  async signOut(@CurrentUser() user: User): Promise<SignOutResponse> {
    try {
      await this.authService.signOut(user);
      return {
        success: true,
      };
    } catch (error) {
      this.logger.error(error);
      return {
        success: false,
      };
    }
  }

  @Mutation((_) => AuthResponse)
  async signUp(@Args('input') input: SignUpInput): Promise<AuthResponse> {
    return this.authService.signUp(input.email, input.password, input.username);
  }
}
