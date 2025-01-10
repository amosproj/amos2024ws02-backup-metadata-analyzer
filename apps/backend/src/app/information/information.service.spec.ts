import { Test, TestingModule } from '@nestjs/testing';
import { InformationService } from './information.service';
import { BackupInformationDto } from './dto/backupInformation.dto';
import { BackupDataService } from '../backupData/backupData.service';

describe('InformationService', () => {
  let service: InformationService;
  let backupDataService: BackupDataService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        InformationService,
        {
          provide: BackupDataService,
          useValue: {
            getTotalBackupInformation: jest.fn(),
          },
        },
      ],
    }).compile();

    backupDataService = module.get<BackupDataService>(BackupDataService);
    service = module.get<InformationService>(InformationService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should return backup information', async () => {
    const mockBackupInformation: BackupInformationDto = {
      totalBackupSize: 100,
      numberOfBackups: 10,
    };

    jest
      .spyOn(backupDataService, 'getTotalBackupInformation')
      .mockResolvedValue(mockBackupInformation);

    const result = await service.getBackupInformation();
    expect(result).toEqual(mockBackupInformation);
  });
});
