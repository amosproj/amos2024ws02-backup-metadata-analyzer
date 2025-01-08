import { Test, TestingModule } from '@nestjs/testing';
import { MailService } from './mail.service';
import { MailerService } from '@nestjs-modules/mailer';
import { ConfigService } from '@nestjs/config';
import { BackupType } from '../../backupData/dto/backupType';
import { SizeAlertEntity } from '../../alerting/entity/alerts/sizeAlert.entity';
import { SeverityType } from '../../alerting/dto/severityType';
import { SIZE_ALERT } from '../constants';
import { getRepositoryToken } from '@nestjs/typeorm';
import { MailReceiverEntity } from './entity/MailReceiver.entity';
import { NotFoundException } from '@nestjs/common';

jest.mock('path', () => ({
  resolve: jest.fn().mockReturnValue('mocked/path/to/logo.png'),
  dirname: jest.fn(),
}));

const mockMailReceiverRepository = {
  find: jest.fn().mockResolvedValue([
    {
      id: '1',
      mail: 'test@example.com',
    },
  ]),
  save: jest.fn().mockImplementation((receiver) => Promise.resolve(receiver)),
  findOneBy: jest.fn().mockImplementation(({ id }) => {
    if (id === '1') {
      return Promise.resolve({
        id: '1',
        mail: 'test@example.com',
      });
    } else {
      return Promise.resolve(null);
    }
  }),
  delete: jest.fn().mockResolvedValue({}),
};

describe('MailService', () => {
  let service: MailService;
  let mailerService: MailerService;

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
            get: jest.fn().mockReturnValue('true'),
          },
        },
        {
          provide: getRepositoryToken(MailReceiverEntity),
          useValue: mockMailReceiverRepository,
        },
      ],
    }).compile();

    service = module.get(MailService);
    mailerService = module.get(MailerService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should send alert mail', async () => {
    const alert: SizeAlertEntity = {
      id: 'alert-id',
      alertType: {
        id: 'alert-type-id',
        name: SIZE_ALERT,
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
        saveset: 'saveset1',
      },
      creationDate: new Date(),
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
        creationDate: alert.backup?.creationDate?.toLocaleString() ?? '',
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

  it('should get all mail receivers', async () => {
    const receivers = [{ id: '1', mail: 'test@example.com' }];

    expect(await service.getAllMailReceiver()).toStrictEqual(receivers);
  });

  it('should add a mail receiver', async () => {
    const createMailReceiverDto = { mail: 'new@example.com' };
    const savedReceiver = { mail: 'new@example.com' };

    await service.addMailReceiver(createMailReceiverDto);

    expect(mockMailReceiverRepository.save).toBeCalledWith({
      mail: createMailReceiverDto.mail,
    });

    expect(await service.addMailReceiver(createMailReceiverDto)).toStrictEqual(
      savedReceiver
    );
  });

  it('should remove a mail receiver', async () => {
    const id = '1';
    await service.removeMailReceiver(id);

    expect(mockMailReceiverRepository.findOneBy).toHaveBeenCalledWith({ id });
    expect(mockMailReceiverRepository.delete).toHaveBeenCalledWith({ id });
  });

  it('should throw NotFoundException if mail receiver not found', async () => {
    const id = 'non-existent-id';

    await expect(service.removeMailReceiver(id)).rejects.toThrow(
      NotFoundException
    );
  });
});
