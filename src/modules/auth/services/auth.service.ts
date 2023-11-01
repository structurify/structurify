import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  Logger,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { Token, User } from '@prisma/client';
import { I18nService } from 'nestjs-i18n';
import { ConfigService } from '@nestjs/config';
import * as dayjs from 'dayjs';

import { generateRandomString } from '@shared/utils';
import { ResetPasswordInput } from '@contracts/auth';
import { UsersService } from '@modules/users';
import { MailingService } from '@app/modules/communication';
import { TokensService } from './tokens.service';
import { EmailTemplate } from '@app/contracts/communication';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly tokensService: TokensService,
    private readonly i18nService: I18nService,
    private readonly mailingService: MailingService,
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

  async validateRefreshToken(
    refreshToken: string,
    tokenId: string,
    payload: any,
  ) {
    const foundToken = await this.tokensService.findOneById(tokenId);
    if (!foundToken) {
      throw new UnauthorizedException();
    }

    const isMatch = await bcrypt.compare(refreshToken, foundToken.refreshToken);
    if (!isMatch) {
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

  async signOut(user: User): Promise<void> {
    await this.tokensService.deleteForUser({
      userId: user.id,
      deletedBy: {
        user: user.id,
      },
    });
  }

  async forgotPassword(email: string): Promise<void> {
    const user = await this.usersService.findOneByEmail(email);

    if (!user) {
      throw new NotFoundException();
    }

    const token = generateRandomString();
    const expiresAt = dayjs().add(1, 'day').toDate();

    await this.usersService.update({
      id: user.id,
      resetToken: token,
      resetTokenExpiresAt: expiresAt,
      updatedBy: {
        service: 'auth-module',
        serviceDetail: 'forgot password',
      },
    });

    const url = `${this.configService.get('WEB_URL')}/password/reset?userId=${
      user.id
    }&token=${token}`;

    const context = {
      url,
      subject: this.i18nService.translate(
        'auth.emails.forgot-password.subject',
      ),
      heading: this.i18nService.translate(
        'auth.emails.forgot-password.heading',
        {
          args: {
            username: user.username,
          },
        },
      ),
      paragraph1: this.i18nService.translate(
        'auth.emails.forgot-password.paragraph1',
      ),
      button: this.i18nService.translate('auth.emails.forgot-password.button'),
      paragraph2: this.i18nService.translate(
        'auth.emails.forgot-password.paragraph2',
      ),
    };

    this.logger.log('sendInvite - context', {
      context,
    });

    await this.mailingService.sendMail({
      to: user.email,
      subject: context.subject,
      template: EmailTemplate.AUTH_FORGOT_PASSWORD,
      context,
      sendBy: {
        service: 'auth-module',
        serviceDetails: 'Forgot password request',
      },
    });
  }

  async resetPassword(dto: ResetPasswordInput) {
    const user = await this.usersService.findOneById(dto.userId);
    if (!user) {
      throw new NotFoundException();
    }

    const expiresAt = user.resetTokenExpiresAt;

    if (dayjs().isAfter(dayjs(expiresAt))) {
      throw new BadRequestException(
        this.i18nService.translate('auth.errors.reset-password.expired-token'),
      );
    }

    if (user.resetToken !== dto.token) {
      throw new BadRequestException(
        this.i18nService.translate('auth.errors.reset-password.invalid-token'),
      );
    }

    await this.usersService.updatePassword({
      userId: user.id,
      newPassword: dto.newPassword,
      confirmPassword: dto.confirmPassword,
      updatedBy: {
        service: 'auth-module',
        serviceDetail: 'reset password',
      },
    });

    await this.tokensService.deleteForUser({
      userId: user.id,
      deletedBy: {
        service: 'auth-module',
        serviceDetail: 'reset password',
      },
    });

    return this.getTokens(user);
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

    const hash = await bcrypt.hash(refreshToken, 10);

    const num = refreshExpire!.match(/\d+/g);
    const letr = refreshExpire!.match(/[a-zA-Z]+/g);
    const expiresAt = dayjs()
      .add(Number(num![0]), letr![0] as any)
      .toDate();

    let currentToken = token;

    if (!!token) {
      currentToken = await this.tokensService.update({
        id: token.id,
        refreshToken: hash,
        expiresAt,
        updatedBy: {
          user: user.id,
        },
      });
    } else {
      currentToken = await this.tokensService.create({
        userId: user.id,
        refreshToken: hash,
        expiresAt,
        createdBy: {
          user: user.id,
        },
      });
    }

    return {
      accessToken,
      refreshToken,
      refreshTokenId: currentToken.id,
    };
  }
}
