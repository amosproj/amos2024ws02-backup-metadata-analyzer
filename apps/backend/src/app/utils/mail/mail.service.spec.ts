import { Test, TestingModule } from '@nestjs/testing';
import { MailService } from './mail.service';
import { MailerService } from '@nestjs-modules/mailer';
import { ConfigService } from '@nestjs/config';
import { BackupType } from '../../backupData/dto/backupType';
import { SizeAlertEntity } from '../../alerting/entity/alerts/sizeAlert.entity';
import { SeverityType } from '../../alerting/dto/severityType';

jest.mock('path', () => ({
  resolve: jest.fn().mockReturnValue('mocked/path/to/logo.png'),
}));

describe('MailService', () => {
  let service: MailService;
  let mailerService: MailerService;
  let configService: ConfigService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MailService,
        {
          provide: MailerService,
          useValue: {
            sendMail: jest.fn(),
          },
        },
        {
          provide: ConfigService,
          useValue: {
            getOrThrow: jest.fn().mockReturnValue('test@example.com'),
            get: jest.fn().mockReturnValue('true'),
          },
        },
      ],
    }).compile();

    service = module.get(MailService);
    mailerService = module.get(MailerService);
    configService = module.get(ConfigService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should send alert mail', async () => {
    const alert: SizeAlertEntity = {
      id: 'alert-id',
      alertType: {
        id: 'alert-type-id',
        name: 'SIZE_ALERT',
        severity: SeverityType.CRITICAL,
        user_active: true,
        master_active: true,
      },
      size: 100,
      referenceSize: 200,
      backup: {
        id: 'backup-id',
        sizeMB: 100,
        type: BackupType.FULL,
        creationDate: new Date(),
      },
    };

    await service.sendAlertMail(alert);

    expect(mailerService.sendMail).toHaveBeenCalledWith({
      to: ['test@example.com'],
      subject: 'Alert has been triggered',
      template: './alertMail',
      context: {
        reason: 'Size of latest Backup decreased by 50 %',
        description:
          'Size of latest Backup decreased by 50% compared to the previous Backup. This could indicate a problem with the Backup.',
        value: '100 MB',
        referenceValue: '200 MB',
        valueColumnName: 'Size of backup',
        referenceValueColumnName: 'Size of previous backup',
        backupId: 'backup-id',
        creationDate: alert.backup.creationDate.toLocaleString(),
      },
      attachments: [
        {
          filename: 'logo.png',
          path: 'mocked/path/to/logo.png',
          cid: 'logo',
          contentType: 'image/png',
        },
      ],
    });
  });

  it('should send mail with correct parameters', async () => {
    const to = ['test@example.com'];
    const subject = 'Test Subject';
    const template = 'testTemplate';
    const context = { key: 'value' };
    const attachments = [
      { filename: 'test.png', path: 'test/path', cid: 'test' },
    ];

    await service.sendMail(to, subject, template, context, attachments);

    expect(mailerService.sendMail).toHaveBeenCalledWith({
      to,
      subject,
      template: `./${template}`,
      context,
      attachments,
    });
  });
});
