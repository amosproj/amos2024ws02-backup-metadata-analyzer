import { Test, TestingModule } from '@nestjs/testing';
import { AlertingService } from './alerting.service';
import { MailService } from '../utils/mail/mail.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { AlertEntity } from './entity/alert.entity';
import { MoreThanOrEqual, Repository } from 'typeorm';
import { BackupDataService } from '../backupData/backupData.service';
import { NotFoundException } from '@nestjs/common';
import { CreateAlertDto } from './dto/createAlert.dto';
import { AlertType } from './dto/alertType';
import { BackupDataEntity } from '../backupData/entity/backupData.entity';
import { BackupType } from '../backupData/dto/backupType';

const mockedBackupDataEntity: BackupDataEntity = {
  id: 'backup-id',
  sizeMB: 100,
  type: BackupType.FULL,
  creationDate: new Date(),
};

const alerts: AlertEntity[] = [
  {
    id: 'alert-id-1',
    type: AlertType.SIZE_DECREASED,
    value: 100,
    referenceValue: 200,
    backup: mockedBackupDataEntity,
  },
  {
    id: 'alert-id-2',
    type: AlertType.SIZE_INCREASED,
    value: 200,
    referenceValue: 100,
    backup: mockedBackupDataEntity,
  },
];
describe('AlertingService', () => {
  let service: AlertingService;
  let alertRepository: Repository<AlertEntity>;
  let mailService: MailService;
  let backupDataService: BackupDataService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AlertingService,
        {
          provide: getRepositoryToken(AlertEntity),
          useValue: {
            find: jest.fn().mockResolvedValue(alerts),
            findOneBy: jest.fn().mockResolvedValue(null),
            save: jest.fn(),
          },
        },
        {
          provide: MailService,
          useValue: {
            sendAlertMail: jest.fn(),
          },
        },
        {
          provide: BackupDataService,
          useValue: {
            findOneById: jest.fn().mockImplementation((id: string) => {
              if (id === 'backup-id') {
                return mockedBackupDataEntity;
              }
              return null;
            }),
          },
        },
      ],
    }).compile();

    service = module.get(AlertingService);
    alertRepository = module.get(getRepositoryToken(AlertEntity));
    mailService = module.get(MailService);
    backupDataService = module.get(BackupDataService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('createAlert', () => {
    it('should create and save an alert', async () => {
      const createAlertDto: CreateAlertDto = {
        type: AlertType.SIZE_DECREASED,
        value: 100,
        referenceValue: 200,
        backupId: 'backup-id',
      };

      await service.createAlert(createAlertDto);

      expect(backupDataService.findOneById).toHaveBeenCalledWith('backup-id');
      expect(alertRepository.save).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 1,
          value: 100,
          referenceValue: 200,
          backup: mockedBackupDataEntity,
        })
      );
      expect(mailService.sendAlertMail).toHaveBeenCalledTimes(1);
    });

    it('should throw NotFoundException if backup not found', async () => {
      const createAlertDto: CreateAlertDto = {
        type: AlertType.SIZE_DECREASED,
        value: 100,
        referenceValue: 200,
        backupId: 'not-existing-id',
      };

      await expect(service.createAlert(createAlertDto)).rejects.toThrow(
        NotFoundException
      );
    });
  });

  describe('findAllAlerts', () => {
    it('should return all alerts', async () => {
      const result = await service.findAllAlerts();

      expect(result).toEqual(alerts);
      expect(alertRepository.find).toHaveBeenCalled();
    });

    it('should return alerts for a specific backup', async () => {
      const result = await service.findAllAlerts('backup-id');

      expect(result).toEqual(alerts);
      expect(alertRepository.find).toHaveBeenCalledWith({
        where: { backup: { id: 'backup-id' } },
      });
    });

    it('should return alerts for the last x days', async () => {
      const days = 7;
      const date = new Date();
      date.setDate(date.getDate() - days);

      const result = await service.findAllAlerts(undefined, days);

      expect(result).toEqual(alerts);
      expect(alertRepository.find).toHaveBeenCalledWith({
        where: { backup: { creationDate: MoreThanOrEqual(expect.any(Date)) } },
      });
    });
  });

  describe('triggerAlertMail', () => {
    it('should call sendAlertMail of MailService', async () => {
      const alert = alerts[0];

      await service.triggerAlertMail(alert);

      expect(mailService.sendAlertMail).toHaveBeenCalledWith(alert);
    });
  });
});
