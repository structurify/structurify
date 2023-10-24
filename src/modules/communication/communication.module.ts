import { MailerModule } from '@nestjs-modules/mailer';
import { HandlebarsAdapter } from '@nestjs-modules/mailer/dist/adapters/handlebars.adapter';
import { join } from 'path';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { Module } from '@nestjs/common';
import { I18nModule, I18nService } from 'nestjs-i18n';

import { MailingRepository } from './repositories';

@Module({
  imports: [
    MailerModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService, I18nService],
      useFactory: (configService: ConfigService, i18n: I18nService) => ({
        transport: configService.get('MAILER_DSN'),
        template: {
          dir: join(__dirname, '/templates'),
          adapter: new HandlebarsAdapter({ t: i18n.hbsHelper }),
          options: {
            strict: true,
          },
        },
      }),
    }),
  ],
  providers: [MailingRepository],
  exports: [MailingRepository],
})
export class CommunicationModule {}
