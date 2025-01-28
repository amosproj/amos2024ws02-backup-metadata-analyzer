import { Test, TestingModule } from '@nestjs/testing';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { AnalyzerServiceService } from './analyzer-service.service';
import { AxiosResponse } from 'axios';
import { of } from 'rxjs';

describe('AnalyzerServiceService', () => {
  let service: AnalyzerServiceService;
  let httpService: HttpService;
  let configService: ConfigService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AnalyzerServiceService,
        {
          provide: HttpService,
          useValue: {
            post: jest.fn(),
            get: jest.fn(),
          },
        },
        {
          provide: ConfigService,
          useValue: {
            getOrThrow: jest.fn().mockReturnValue('http://localhost:8000'),
          },
        },
      ],
    }).compile();

    service = module.get<AnalyzerServiceService>(AnalyzerServiceService);
    httpService = module.get<HttpService>(HttpService);
    configService = module.get<ConfigService>(ConfigService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should trigger all analyzers', async () => {
    jest.spyOn(service, 'updateBasicBackupData').mockResolvedValue();
    jest
      .spyOn(service, 'triggerSizeAnalysisForFullBackups')
      .mockImplementation();
    jest
      .spyOn(service, 'triggerSizeAnalysisForDiffBackups')
      .mockImplementation();
    jest
      .spyOn(service, 'triggerSizeAnalysisForIncBackups')
      .mockImplementation();
    jest.spyOn(service, 'triggerCreationDateAnalysis').mockImplementation();
    jest.spyOn(service, 'triggerStorageFillAnalysis').mockImplementation();

    await service.triggerAll();

    expect(service.updateBasicBackupData).toHaveBeenCalled();
    expect(service.triggerSizeAnalysisForFullBackups).toHaveBeenCalled();
    expect(service.triggerSizeAnalysisForDiffBackups).toHaveBeenCalled();
    expect(service.triggerSizeAnalysisForIncBackups).toHaveBeenCalled();
    expect(service.triggerCreationDateAnalysis).toHaveBeenCalled();
    expect(service.triggerStorageFillAnalysis).toHaveBeenCalled();
  });

  it('should update basic backup data', async () => {
    jest
      .spyOn(httpService, 'post')
      .mockReturnValue(of({} as AxiosResponse<any>));

    await service.updateBasicBackupData();

    expect(httpService.post).toHaveBeenCalledWith(
      'http://localhost:8000/updating/basicBackupData'
    );
  });

  it('should trigger storage fill analysis', async () => {
    jest
      .spyOn(httpService, 'post')
      .mockReturnValue(of({ data: { count: 5 } } as AxiosResponse<any>));

    service.triggerStorageFillAnalysis();

    expect(httpService.post).toHaveBeenCalledWith(
      'http://localhost:8000/alerting/storageCapacity?alertLimit=-1'
    );
  });

  it('should trigger creation date analysis', async () => {
    jest
      .spyOn(httpService, 'post')
      .mockReturnValue(of({ data: { count: 5 } } as AxiosResponse<any>));

    service.triggerCreationDateAnalysis();

    expect(httpService.post).toHaveBeenCalledWith(
      'http://localhost:8000/alerting/creationDate?alertLimit=-1'
    );
  });

  it('should trigger size analysis for full backups', async () => {
    jest
      .spyOn(httpService, 'post')
      .mockReturnValue(of({ data: { count: 5 } } as AxiosResponse<any>));

    await service.triggerSizeAnalysisForFullBackups();

    expect(httpService.post).toHaveBeenCalledWith(
      'http://localhost:8000/alerting/size/fullBackups?alertLimit=-1'
    );
  });

  it('should trigger size analysis for diff backups', async () => {
    jest
      .spyOn(httpService, 'post')
      .mockReturnValue(of({ data: { count: 5 } } as AxiosResponse<any>));

    await service.triggerSizeAnalysisForDiffBackups();

    expect(httpService.post).toHaveBeenCalledWith(
      'http://localhost:8000/alerting/size/diffBackups?alertLimit=-1'
    );
  });

  it('should trigger size analysis for inc backups', async () => {
    jest
      .spyOn(httpService, 'post')
      .mockReturnValue(of({ data: { count: 5 } } as AxiosResponse<any>));

    await service.triggerSizeAnalysisForIncBackups();

    expect(httpService.post).toHaveBeenCalledWith(
      'http://localhost:8000/alerting/size/incBackups?alertLimit=-1'
    );
  });
});
