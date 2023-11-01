import { Test, TestingModule } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { ConfigService } from '@nestjs/config';
import { I18nService } from 'nestjs-i18n';

import { PrismaService } from '@providers/db/prisma';
import { EventsService } from '@modules/events';
import { UsersService } from '@modules/users';
import { MailingService } from '@modules/communication';

import { AuthService } from './auth.service';
import { TokensService } from './tokens.service';

describe('AuthService', () => {
  let service: AuthService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: UsersService, useValue: {} },
        { provide: JwtService, useValue: {} },
        { provide: CACHE_MANAGER, useValue: {} },
        { provide: PrismaService, useValue: {} },
        { provide: EventsService, useValue: {} },
        { provide: TokensService, useValue: {} },
        { provide: ConfigService, useValue: {} },
        { provide: I18nService, useValue: {} },
        { provide: MailingService, useValue: {} },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
