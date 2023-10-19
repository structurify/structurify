import { MailerService } from '@nestjs-modules/mailer';
import * as fs from 'fs';
import { compile } from 'handlebars';
// @ts-ignore
import * as mjml2html from 'mjml';

import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { join } from 'path';

interface SendMail {
  template: string;
  to: string;
  subject: string;
  context: any;
  [key: string]: any;
}

@Injectable()
export class MailingRepository {
  private readonly logger = new Logger(MailingRepository.name);

  constructor(
    private readonly configService: ConfigService,
    private readonly mailerService: MailerService,
  ) {}

  async sendMail(params: SendMail): Promise<void> {
    this.logger.debug('MailingRepository#sendMail - params', {
      params,
    });

    const { to, template, context, subject, ...override } = params;

    const path = join(__dirname, `/src/templates/${template}.hbs`);

    const source = fs.readFileSync(path, 'utf8');
    const compileTemplate = compile(source);
    const mjml = compileTemplate(context);
    const { html } = mjml2html(mjml);

    await this.mailerService.sendMail({
      ...override,
      to,
      subject,
      html,
      from: this.configService.get('MAILER_FROM'),
    });
  }
}
