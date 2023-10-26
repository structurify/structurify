import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, Logger, UnauthorizedException } from '@nestjs/common';
import { Request } from 'express';

import { AuthService } from '../services';

@Injectable()
export class JwtRefreshStrategy extends PassportStrategy(
  Strategy,
  'jwt-refresh-token',
) {
  private readonly logger = new Logger(JwtRefreshStrategy.name);

  constructor(
    private configService: ConfigService,
    private authService: AuthService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get('JWT_REFRESH_TOKEN_SECRET'),
      passReqToCallback: true,
    });
  }

  async validate(request: Request, payload: any) {
    // @ts-ignore
    const refreshToken = request
      .header('Authorization')
      .replace('Bearer', '')
      .trim();

    if (!refreshToken) {
      throw new UnauthorizedException();
    }

    const res = await this.authService.validateRefreshToken(
      refreshToken,
      payload,
    );

    return {
      ...res.user,
      token: res.token,
    };
  }
}
