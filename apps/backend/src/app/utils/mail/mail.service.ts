import { MailerService } from '@nestjs-modules/mailer';
import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as path from 'path';

@Injectable()
export class MailService {
  readonly logger = new Logger(MailService.name);

  constructor(
    private mailerService: MailerService,
    private configService: ConfigService
  ) {}

  async sendAlertMail(reason: string, description: string) {
    const receivers =
      this.configService.getOrThrow<string>('MAILING_LIST').split(',') || [];
    const context = {
      reason,
      description,
    };

    const logoPath = path.resolve('apps/backend/src/assets/team_logo.png');

    const attachments = [
      {
        filename: 'logo.png',
        path: logoPath,
        cid: 'logo',
        contentType: 'image/png', // Ensure the MIME type is set correctly
      },
    ];
    await this.sendMail(
      receivers,
      'Alert has been triggered',
      'alertMail',
      context,
      attachments
    );
  }

  async sendMail(
    receivers: string[],
    subject: string,
    template: string,
    context: Record<string, string>,
    attachments?: any[]
  ) {
    this.logger.log(
      `Sending mail to: ${receivers.join(',')} with subject "${subject}"`
    );
    await this.mailerService.sendMail({
      to: receivers,
      subject,
      template: `./${template}`, // `.hbs` extension is appended automatically
      context,
      attachments: attachments ?? [],
    });
  }
}
