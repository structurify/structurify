import { Test, TestingModule } from '@nestjs/testing';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { ConfigService } from '@nestjs/config';
import { I18nService } from 'nestjs-i18n';

import { EventsService } from '@modules/events/services';
import { MailingRepository } from '@modules/communication/repositories';
import { UsersService } from '@modules/users/services';
import { PrismaService } from '@providers/db/prisma/services';

import { InvitesService } from './invites.service';
import { OrganizationsService } from './organizations.service';
import { MembersService } from './members.service';

describe('InvitesService', () => {
  let service: InvitesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        InvitesService,
        { provide: EventsService, useValue: {} },
        { provide: PrismaService, useValue: {} },
        { provide: CACHE_MANAGER, useValue: {} },
        { provide: MembersService, useValue: {} },
        { provide: OrganizationsService, useValue: {} },
        { provide: MailingRepository, useValue: {} },
        { provide: ConfigService, useValue: {} },
        { provide: I18nService, useValue: {} },
        { provide: UsersService, useValue: {} },
      ],
    }).compile();

    service = module.get<InvitesService>(InvitesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
