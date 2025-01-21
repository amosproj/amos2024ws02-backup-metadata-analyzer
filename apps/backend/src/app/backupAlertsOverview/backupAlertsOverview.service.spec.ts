import { Test, TestingModule } from '@nestjs/testing';
import { BackupAlertsOverviewService } from './backupAlertsOverview.service';
import { Repository } from 'typeorm';
import { getRepositoryToken } from '@nestjs/typeorm';
import { BackupDataEntity } from '../backupData/entity/backupData.entity';
import { BackupAlertsOverviewEntity } from './entity/backupAlertsOverview.entity';
import { BackupAlertsOverviewDto } from './dto/backupAlertsOverview.dto';

describe('BackupAlertsOverviewService', () => {
  let service: BackupAlertsOverviewService;
  let backupRepositoryMock: jest.Mocked<Repository<BackupDataEntity>>;
  let backupAlertsOverviewRepositoryMock: jest.Mocked<
    Repository<BackupAlertsOverviewEntity>
  >;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BackupAlertsOverviewService,
        {
          provide: getRepositoryToken(BackupDataEntity),
          useValue: {
            query: jest.fn(),
          },
        },
        {
          provide: getRepositoryToken(BackupAlertsOverviewEntity),
          useValue: {
            createQueryBuilder: jest.fn(() => ({
              insert: jest.fn().mockReturnThis(),
              into: jest.fn().mockReturnThis(),
              values: jest.fn().mockReturnThis(),
              orUpdate: jest.fn().mockReturnThis(),
              execute: jest.fn(),
            })),
          },
        },
      ],
    }).compile();

    service = module.get<BackupAlertsOverviewService>(
      BackupAlertsOverviewService
    );
    backupRepositoryMock = module.get(getRepositoryToken(BackupDataEntity));
    backupAlertsOverviewRepositoryMock = module.get(
      getRepositoryToken(BackupAlertsOverviewEntity)
    );
  });

  it('should return BackupAlertsOverviewDto with correct counts', async () => {
    const mockQueryResult = [
      { alertClass: 'OK', totalBackupsForClass: 5 },
      { alertClass: 'INFO', totalBackupsForClass: 3 },
      { alertClass: 'WARNING', totalBackupsForClass: 2 },
      { alertClass: 'CRITICAL', totalBackupsForClass: 1 },
    ];
    backupRepositoryMock.query.mockResolvedValue(mockQueryResult);

    const result = await service.getBackupCountsByAlertClass();

    expect(result).toEqual({
      ok: 5,
      info: 3,
      warning: 2,
      critical: 1,
    });

    expect(backupRepositoryMock.query).toHaveBeenCalledTimes(1);
  });

  it('should insert counts into BackupAlertsOverviewEntity', async () => {
    const mockQueryResult = [
      { alertClass: 'OK', totalBackupsForClass: 5 },
      { alertClass: 'INFO', totalBackupsForClass: 3 },
      { alertClass: 'WARNING', totalBackupsForClass: 2 },
      { alertClass: 'CRITICAL', totalBackupsForClass: 1 },
    ];
    backupRepositoryMock.query.mockResolvedValue(mockQueryResult);

    const insertMock = jest.fn().mockReturnThis();
    const valuesMock = jest.fn().mockReturnThis();
    const orUpdateMock = jest.fn().mockReturnThis();
    const executeMock = jest.fn();

    backupAlertsOverviewRepositoryMock.createQueryBuilder = jest.fn(
      () =>
        ({
          insert: insertMock,
          into: jest.fn().mockReturnThis(),
          values: valuesMock,
          orUpdate: orUpdateMock,
          execute: executeMock,
        } as any)
    );

    await service.getBackupCountsByAlertClass();

    expect(insertMock).toHaveBeenCalled();
    expect(valuesMock).toHaveBeenCalledWith({
      id: '00000000-0000-0000-0000-000000000001',
      ok: 5,
      info: 3,
      warning: 2,
      critical: 1,
    });
    expect(orUpdateMock).toHaveBeenCalledWith(
      ['ok', 'info', 'warning', 'critical'],
      ['id']
    );
    expect(executeMock).toHaveBeenCalled();
  });
});
