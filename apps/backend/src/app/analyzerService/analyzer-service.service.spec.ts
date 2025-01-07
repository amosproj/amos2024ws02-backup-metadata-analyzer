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
    jest.spyOn(service, 'triggerSizeAnalysis').mockImplementation();
    jest.spyOn(service, 'triggerCreationDateAnalysis').mockImplementation();
    jest.spyOn(service, 'triggerStorageFillAnalysis').mockImplementation();

    await service.triggerAll();

    expect(service.updateBasicBackupData).toHaveBeenCalled();
    expect(service.triggerSizeAnalysis).toHaveBeenCalled();
    expect(service.triggerCreationDateAnalysis).toHaveBeenCalled();
    expect(service.triggerStorageFillAnalysis).toHaveBeenCalled();
  });

  it('should update basic backup data', async () => {
    jest.spyOn(httpService, 'post').mockReturnValue(of({} as AxiosResponse<any>));

    await service.updateBasicBackupData();

    expect(httpService.post).toHaveBeenCalledWith(
      'http://localhost:8000/updateBasicBackupData'
    );
  });

  it('should trigger storage fill analysis', async () => {
    jest
      .spyOn(httpService, 'post')
      .mockReturnValue(of({ data: { count: 5 } } as AxiosResponse<any>));

    service.triggerStorageFillAnalysis();

    expect(httpService.post).toHaveBeenCalledWith(
      'http://localhost:8000/simpleRuleBasedAnalysisStorageCapacity?alertLimit=-1'
    );
  });

  it('should trigger creation date analysis', async () => {
    jest
      .spyOn(httpService, 'post')
      .mockReturnValue(of({ data: { count: 5 } } as AxiosResponse<any>));

    service.triggerCreationDateAnalysis();

    expect(httpService.post).toHaveBeenCalledWith(
      'http://localhost:8000/simpleRuleBasedAnalysisCreationDates?alertLimit=-1'
    );
  });

  it('should trigger size analysis', async () => {
    jest
      .spyOn(httpService, 'post')
      .mockReturnValue(of({ data: { count: 5 } } as AxiosResponse<any>));

    service.triggerSizeAnalysis();

    expect(httpService.post).toHaveBeenCalledWith(
      'http://localhost:8000/simpleRuleBasedAnalysis?alertLimit=-1'
    );
    expect(httpService.post).toHaveBeenCalledWith(
      'http://localhost:8000/simpleRuleBasedAnalysisDiff?alertLimit=-1'
    );
    expect(httpService.post).toHaveBeenCalledWith(
      'http://localhost:8000/simpleRuleBasedAnalysisInc?alertLimit=-1'
    );
  });
});
