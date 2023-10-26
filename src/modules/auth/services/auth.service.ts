import {
  ForbiddenException,
  Injectable,
  Logger,
  UnauthorizedException,
} from '@nestjs/common';
import { UsersService } from '@modules/users/services';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { Token, User } from '@prisma/client';
import { ConfigService } from '@nestjs/config';
import { TokensService } from './tokens.service';
import * as dayjs from 'dayjs';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
    private configService: ConfigService,
    private tokensService: TokensService,
  ) {}

  async validateUser(username: string, password: string): Promise<User> {
    const user = await this.usersService.findOneByUsername(username);

    if (user && (await bcrypt.compare(password, user.password))) {
      return user;
    }

    throw new UnauthorizedException();
  }

  async signIn(user: User) {
    return this.getTokens(user);
  }

  async signUp(email: string, password: string, username: string) {
    const user = await this.usersService.create({
      email,
      username,
      password,
      createdBy: {
        service: 'auth-module',
        serviceDetail: 'user registration',
      },
    });

    return this.getTokens(user);
  }

  async validateRefreshToken(refreshToken: string, payload: any) {
    const foundToken = await this.tokensService.findOneByToken(refreshToken);
    if (!foundToken) {
      throw new UnauthorizedException();
    }

    const expiresAt = dayjs.unix(payload.exp);
    const diff = dayjs().diff(expiresAt, 'seconds');

    if (payload.sub !== foundToken.userId) {
      this.logger.debug('Token compromised');

      await this.tokensService.deleteForUser({
        userId: payload.sub,
        deletedBy: {
          user: payload.sub,
        },
      });
      throw new ForbiddenException();
    }

    const user = await this.usersService.findOneById(foundToken.userId);
    if (!user) {
      this.logger.debug('User not found');
      throw new UnauthorizedException();
    }

    if (diff < 60 * 1 * 1) {
      return {
        user,
        token: foundToken,
      };
    }

    throw new UnauthorizedException();
  }

  async refreshToken(user: User, token?: Token) {
    return this.getTokens(user, token);
  }

  private async getTokens(user: User, token?: Token) {
    const refreshExpire = this.configService.get<string>(
      'JWT_REFRESH_TOKEN_EXPIRATION_TIME',
    );

    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(
        {
          sub: user.id,
          username: user.username,
        },
        {
          secret: this.configService.get<string>('JWT_ACCESS_TOKEN_SECRET'),
          expiresIn: this.configService.get<string>(
            'JWT_ACCESS_TOKEN_EXPIRATION_TIME',
          ),
        },
      ),
      this.jwtService.signAsync(
        {
          sub: user.id,
          username: user.username,
        },
        {
          secret: this.configService.get<string>('JWT_REFRESH_TOKEN_SECRET'),
          expiresIn: refreshExpire,
        },
      ),
    ]);

    const num = refreshExpire!.match(/\d+/g);
    const letr = refreshExpire!.match(/[a-zA-Z]+/g);
    const expiresAt = dayjs()
      .add(Number(num![0]), letr![0] as any)
      .toDate();

    if (!!token) {
      await this.tokensService.update({
        id: token.id,
        refreshToken,
        expiresAt,
        updatedBy: {
          user: user.id,
        },
      });
    } else {
      await this.tokensService.create({
        userId: user.id,
        refreshToken,
        expiresAt,
        createdBy: {
          user: user.id,
        },
      });
    }

    return {
      accessToken,
      refreshToken,
    };
  }
}
