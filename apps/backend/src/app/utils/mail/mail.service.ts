import { MailerService } from '@nestjs-modules/mailer';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class MailService {
  constructor(
    private mailerService: MailerService,
    private configService: ConfigService
  ) {}

  async sendAlertMail() {
    const to = this.configService.getOrThrow<string>('MAILING_LIST').split(',') || [];
    const context = {
      alert: 'Size has been increased by 35% in the last 24 hours',
    };
    await this.sendMail(to, 'Alert has been triggered', 'alertMail', context);
  }

  async sendMail(
    to: string[],
    subject: string,
    template: string,
    context: Record<string, string>
  ) {

    await this.mailerService.sendMail({
      to,
      subject,
      template: `./${template}`, // `.hbs` extension is appended automatically
      context,
    });
  }
}
