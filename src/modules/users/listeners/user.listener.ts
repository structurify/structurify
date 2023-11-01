import { Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { I18nService } from 'nestjs-i18n';

import { UserCreatedEvent, UserEvents } from '@contracts/users';
import { MailingService } from '@modules/communication';
import { EmailTemplate } from '@app/contracts/communication';

@Injectable()
export class UserListener {
  private readonly logger = new Logger(UserListener.name);

  constructor(
    private readonly i18n: I18nService,
    private readonly mailingService: MailingService,
  ) {}

  @OnEvent(UserEvents.USER_CREATED)
  async handleUserCreatedEvent(event: UserCreatedEvent) {
    try {
      this.logger.log('handleUserCreatedEvent - event', {
        event,
      });

      const context = {
        subject: this.i18n.translate('users.emails.welcome.subject'),
        body: this.i18n.translate('users.emails.welcome.body', {
          args: {
            username: event.after!.username,
          },
        }),
      };

      this.logger.log('handleUserCreatedEvent - context', {
        event,
      });

      await this.mailingService.sendMail({
        to: event.after!.email,
        subject: context.subject,
        template: EmailTemplate.WELCOME,
        context,
        sendBy: {
          service: 'users-module',
          serviceDetails: 'user listener for created event',
        },
      });

      this.logger.log('handleUserCreatedEvent - sent');
    } catch (error) {
      console.log('error', error);
      this.logger.error('handleUserCreatedEvent - error', {
        error,
      });
    }
  }
}
