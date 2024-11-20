import { Injectable } from '@nestjs/common';
import { MailService } from '../utils/mail/mail.service';

@Injectable()
export class AlertingService {
  constructor(private mailService: MailService) {}

  async triggerAlertMail(reason: string, description: string) {
    await this.mailService.sendAlertMail(reason, description);
  }
}
