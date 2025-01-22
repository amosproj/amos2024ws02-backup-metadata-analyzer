import { Test, TestingModule } from '@nestjs/testing';
import { BackupAlertsOverviewService } from './backupAlertsOverview.service';
import { Repository } from 'typeorm';
import { getRepositoryToken } from '@nestjs/typeorm';
import { BackupDataEntity } from '../backupData/entity/backupData.entity';
import { BackupAlertsOverviewDto } from './dto/backupAlertsOverview.dto';

describe('BackupAlertsOverviewService', () => {
  let service: BackupAlertsOverviewService;
  let backupRepositoryMock: jest.Mocked<Repository<BackupDataEntity>>;

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
      ],
    }).compile();

    service = module.get<BackupAlertsOverviewService>(
      BackupAlertsOverviewService
    );
    backupRepositoryMock = module.get(getRepositoryToken(BackupDataEntity));
  });

  it('should return BackupAlertsOverviewDto with correct counts', async () => {
    const mockQueryResult = [
      { alertClass: 'OK', totalBackupsForClass: 5 },
      { alertClass: 'INFO', totalBackupsForClass: 3 },
      { alertClass: 'WARNING', totalBackupsForClass: 2 },
      { alertClass: 'CRITICAL', totalBackupsForClass: 1 },
    ];
    backupRepositoryMock.query.mockResolvedValue(mockQueryResult);

    const result = await service.getBackupAlertsBySeverity();

    expect(result).toEqual({
      ok: 5,
      info: 3,
      warning: 2,
      critical: 1,
    });

    expect(backupRepositoryMock.query).toHaveBeenCalledTimes(1);
  });
});
