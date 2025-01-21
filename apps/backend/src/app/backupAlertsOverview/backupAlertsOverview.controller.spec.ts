import { Test, TestingModule } from '@nestjs/testing';
import { BackupAlertsOverviewController } from './backupAlertsOverview.controller';
import { BackupAlertsOverviewService } from './backupAlertsOverview.service';
import { BackupAlertsOverviewDto } from './dto/backupAlertsOverview.dto';

describe('BackupAlertsOverviewController', () => {
  let controller: BackupAlertsOverviewController;
  let serviceMock: jest.Mocked<BackupAlertsOverviewService>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [BackupAlertsOverviewController],
      providers: [
        {
          provide: BackupAlertsOverviewService,
          useValue: {
            getBackupCountsByAlertClass: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<BackupAlertsOverviewController>(
      BackupAlertsOverviewController
    );
    serviceMock = module.get(BackupAlertsOverviewService);
  });

  it('should return BackupAlertsOverviewDto from the service', async () => {
    const mockResult = new BackupAlertsOverviewDto();
    mockResult.ok = 5;
    mockResult.info = 3;
    mockResult.warning = 2;
    mockResult.critical = 1;

    serviceMock.getBackupCountsByAlertClass.mockResolvedValue(mockResult);

    const result = await controller.getBackupCountsByAlertClass();

    expect(result).toEqual(mockResult);
    expect(serviceMock.getBackupCountsByAlertClass).toHaveBeenCalledTimes(1);
  });
});
