import { Test, TestingModule } from '@nestjs/testing';
import { AlertingService } from './alerting.service';
import { MailService } from '../utils/mail/mail.service';

describe('AlertingService', () => {
  let service: AlertingService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AlertingService,
        {
          provide: MailService,
          useValue: {
            sendAlertMail: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get(AlertingService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});