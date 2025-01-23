import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BackupAlertsOverviewService } from './backupAlertsOverview.service';
import { BackupDataEntity } from '../backupData/entity/backupData.entity';
import { BackupAlertsOverviewDto } from './dto/backupAlertsOverview.dto';

describe('BackupAlertsOverviewService', () => {
  let service: BackupAlertsOverviewService;
  let repository: Repository<BackupDataEntity>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BackupAlertsOverviewService,
        {
          provide: getRepositoryToken(BackupDataEntity),
          useClass: Repository,
        },
      ],
    }).compile();

    service = module.get<BackupAlertsOverviewService>(
      BackupAlertsOverviewService
    );
    repository = module.get<Repository<BackupDataEntity>>(
      getRepositoryToken(BackupDataEntity)
    );
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should initialize severityOverview on module init', async () => {
    jest
      .spyOn(service, 'getBackupAlertsBySeverity')
      .mockResolvedValue(new BackupAlertsOverviewDto());
    await service.onModuleInit();
    expect(service.getSeverityOverview()).toBeInstanceOf(
      BackupAlertsOverviewDto
    );
  });

  it('should return severity overview', () => {
    const overview = new BackupAlertsOverviewDto();
    service['severityOverview'] = overview;
    expect(service.getSeverityOverview()).toBe(overview);
  });

  it('should get backup alerts by severity', async () => {
    const queryResult = [
      { severity: 'OK', totalBackupsForSeverity: 5 },
      { severity: 'INFO', totalBackupsForSeverity: 3 },
      { severity: 'WARNING', totalBackupsForSeverity: 2 },
      { severity: 'CRITICAL', totalBackupsForSeverity: 1 },
    ];
    jest.spyOn(repository, 'query').mockResolvedValue(queryResult);

    const result = await service.getBackupAlertsBySeverity();

    expect(result).toBeInstanceOf(BackupAlertsOverviewDto);
    expect(result.ok).toBe(5);
    expect(result.info).toBe(3);
    expect(result.warning).toBe(2);
    expect(result.critical).toBe(1);
  });

  it('should return the correct DTO structure', () => {
    const queryResult = [
      { severity: 'OK', totalBackupsForSeverity: 5 },
      { severity: 'INFO', totalBackupsForSeverity: 3 },
      { severity: 'WARNING', totalBackupsForSeverity: 2 },
      { severity: 'CRITICAL', totalBackupsForSeverity: 1 },
    ];
    jest.spyOn(repository, 'query').mockResolvedValue(queryResult);

    const expectedDto = new BackupAlertsOverviewDto();
    expectedDto.ok = 5;
    expectedDto.info = 3;
    expectedDto.warning = 2;
    expectedDto.critical = 1;

    return service.getBackupAlertsBySeverity().then((result) => {
      expect(result).toEqual(expectedDto);
    });
  });
});
