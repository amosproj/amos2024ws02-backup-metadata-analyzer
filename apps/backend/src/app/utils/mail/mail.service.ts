import { MailerService } from '@nestjs-modules/mailer';
import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as path from 'path';
import { AlertEntity } from '../../alerting/entity/alert.entity';
import { AlertType } from '../../alerting/dto/alertType';

@Injectable()
export class MailService {
  readonly logger = new Logger(MailService.name);
  MAILING_ACTIVE = true;

  constructor(
    private mailerService: MailerService,
    private configService: ConfigService
  ) {
    if (this.configService.get('MAILING_ACTIVE') === 'false') {
      this.MAILING_ACTIVE = false;
    }
  }

  async sendAlertMail(alert: AlertEntity) {
    const receivers =
      this.configService.getOrThrow<string>('MAILING_LIST').split(',') || [];

    let reason = '';
    let description = '';
    let valueColumnName = '';
    let referenceValueColumnName = '';
    let percentage: string = 'Infinity';
    switch (alert.type) {
      case AlertType.SIZE_DECREASED:
        if (alert.referenceValue !== 0) {
          percentage = Math.floor(
            (1 - alert.value / alert.referenceValue) * 100
          ).toString();
        }
        valueColumnName = 'Size of backup';
        referenceValueColumnName = 'Size of previous backup';
        reason = `Size of latest Backup decreased by ${percentage} %`;
        description = `Size of latest Backup decreased by ${percentage}% compared to the previous Backup. This could indicate a problem with the Backup.`;
        break;
      case AlertType.SIZE_INCREASED:
        if (alert.referenceValue !== 0) {
          percentage = Math.floor(
            (alert.value / alert.referenceValue - 1) * 100
          ).toString();
        }
        valueColumnName = 'Size of backup';
        referenceValueColumnName = 'Size of previous backup';
        reason = `Size of latest Backup increased by ${percentage} %`;
        description = `Size of latest Backup increased by ${percentage}% compared to the previous Backup. This could indicate a problem with the Backup.`;
        break;
    }

    const context = {
      reason,
      description,
      value: alert.value.toString() + ' Bytes',
      referenceValue: alert.referenceValue.toString() + ' Bytes',
      valueColumnName,
      referenceValueColumnName,
      backupId: alert.backup.id,
      creationDate: alert.backup.creationDate.toLocaleString(),
    };

    const logoPath = path.resolve('apps/backend/src/assets/team_logo.png');

    const attachments = [
      {
        filename: 'logo.png',
        path: logoPath,
        cid: 'logo',
        contentType: 'image/png',
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
    if (!this.MAILING_ACTIVE) {
      this.logger.log(
        `Mailing is disabled. Would have sent mail to: ${receivers.join(
          ','
        )} with subject "${subject}`
      );
      return;
    }
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
