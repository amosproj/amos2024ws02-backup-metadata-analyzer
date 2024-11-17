import { Test, TestingModule } from '@nestjs/testing';
import { AlertingService } from './alerting.service';

describe('AlertingService', () => {
  let service: AlertingService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [AlertingService],
    }).compile();

    service = module.get<AlertingService>(AlertingService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
