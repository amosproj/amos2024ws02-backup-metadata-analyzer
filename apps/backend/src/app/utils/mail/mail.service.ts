import { MailerService } from '@nestjs-modules/mailer';
import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as path from 'path';
import { Alert } from '../../alerting/entity/alerts/alert';
import { SizeAlertEntity } from '../../alerting/entity/alerts/sizeAlert.entity';
import { CREATION_DATE_ALERT, SIZE_ALERT } from '../constants';
import { CreationDateAlertEntity } from '../../alerting/entity/alerts/creationDateAlert.entity';

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

  async sendAlertMail(alert: Alert) {
    const receivers =
      this.configService.getOrThrow<string>('MAILING_LIST').split(',') || [];

    let reason = '';
    let description = '';
    let valueColumnName = '';
    let referenceValueColumnName = '';
    let percentage: string = 'Infinity';
    let value: string = '-';
    let referenceValue: string = '-';
    switch (alert.alertType.name) {
      case SIZE_ALERT:
        const sizeAlert = alert as SizeAlertEntity;
        if (sizeAlert.size < sizeAlert.referenceSize) {
          if (sizeAlert.referenceSize !== 0) {
            percentage = Math.floor(
              (1 - sizeAlert.size / sizeAlert.referenceSize) * 100
            ).toString();
          }
          valueColumnName = 'Size of backup';
          referenceValueColumnName = 'Size of previous backup';
          reason = `Size of latest Backup decreased by ${percentage} %`;
          description = `Size of latest Backup decreased by ${percentage}% compared to the previous Backup. This could indicate a problem with the Backup.`;
          value = sizeAlert.size.toString() + ' MB';
          referenceValue = sizeAlert.referenceSize.toString() + ' MB';
          break;
        } else {
          if (sizeAlert.referenceSize !== 0) {
            percentage = Math.floor(
              (sizeAlert.size / sizeAlert.referenceSize - 1) * 100
            ).toString();
          }
          valueColumnName = 'Size of backup';
          referenceValueColumnName = 'Size of previous backup';
          reason = `Size of latest Backup increased by ${percentage} %`;
          description = `Size of latest Backup increased by ${percentage}% compared to the previous Backup. This could indicate a problem with the Backup.`;
          value = sizeAlert.size.toString() + ' MB';
          referenceValue = sizeAlert.referenceSize.toString() + ' MB';
          break;
        }
      case CREATION_DATE_ALERT:
        const creationDateAlert = alert as CreationDateAlertEntity;
        valueColumnName = 'Creation Date of Backup';
        referenceValueColumnName = 'Date the backup should have been started';
        reason = `Backup was started at an unusual time`;
        description = `Backup was started at ${creationDateAlert.date.toString()}%, but based on previous backups, it should have been started at around ${creationDateAlert.date.toString()}%`;
        value = creationDateAlert.date.toString();
        referenceValue = creationDateAlert.referenceDate.toString();
        break;
    }

    const context = {
      reason,
      description,
      value,
      referenceValue,
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
