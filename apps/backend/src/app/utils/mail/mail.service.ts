import { MailerService } from '@nestjs-modules/mailer';
import { Injectable } from '@nestjs/common';

@Injectable()
export class MailService {
  constructor(private mailerService: MailerService) {}

  async sendAlertMail() {
    await this.mailerService.sendMail({
      to: 'test@test.com',
      subject: 'An alert has been triggered',
      template: './templates/alertMail', // `.hbs` extension is appended automatically
      context: {
        //Variables to be used in the template
      },
    });
  }
}
