import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { AnalyzerController } from './analyzer.controller';
import { AnalyzerServiceService } from './analyzer-service.service';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';

describe('AnalyzerController (e2e)', () => {
  let app: INestApplication;
  let service: AnalyzerServiceService;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      controllers: [AnalyzerController],
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

    app = moduleFixture.createNestApplication();
    await app.init();

    service = moduleFixture.get<AnalyzerServiceService>(AnalyzerServiceService);
  });

  it('/refresh (POST)', async () => {
    jest.spyOn(service, 'triggerAll').mockResolvedValue();

    await request(app.getHttpServer()).post('/analyzer/refresh').expect(201);

    expect(service.triggerAll).toHaveBeenCalled();
  });
});
