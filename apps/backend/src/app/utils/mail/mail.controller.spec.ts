import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { MailController } from './mail.controller';
import { MailService } from './mail.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { MailReceiverEntity } from './entity/MailReceiver.entity';
import { DeleteResult, Repository } from 'typeorm';
import { MailerService } from '@nestjs-modules/mailer';
import { ConfigService } from '@nestjs/config';

describe('MailController (e2e)', () => {
  let app: INestApplication;
  let mailReceiverRepository: Repository<MailReceiverEntity>;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      controllers: [MailController],
      providers: [
        MailService,
        {
          provide: MailerService,
          useValue: {
            sendMail: jest.fn(),
          },
        },
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn().mockReturnValue('true'),
          },
        },
        {
          provide: getRepositoryToken(MailReceiverEntity),
          useValue: {
            find: jest.fn(),
            save: jest.fn(),
            findOneBy: jest.fn(),
            delete: jest.fn(),
          },
        },
      ],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();

    mailReceiverRepository = moduleFixture.get<Repository<MailReceiverEntity>>(
      getRepositoryToken(MailReceiverEntity)
    );
  });

  it('/GET mail receivers', async () => {
    const receivers = [{ id: '1', mail: 'test@example.com' }];
    jest.spyOn(mailReceiverRepository, 'find').mockResolvedValue(receivers);

    const response = await request(app.getHttpServer()).get('/mail');
    expect(response.status).toBe(200);
    expect(response.body).toEqual(receivers);
  });

  it('/POST mail receiver', async () => {
    const createMailReceiverDto = { mail: 'new@example.com' };
    const savedReceiver = { id: '2', mail: 'new@example.com' };
    jest.spyOn(mailReceiverRepository, 'save').mockResolvedValue(savedReceiver);

    const response = await request(app.getHttpServer())
      .post('/mail')
      .send(createMailReceiverDto);
    expect(response.status).toBe(201);
    expect(response.body).toEqual(savedReceiver);
  });

  it('/DELETE mail receiver', async () => {
    const id = 'ea1a2f52-5cf4-44a6-b266-175ee396a18c';
    jest
      .spyOn(mailReceiverRepository, 'findOneBy')
      .mockResolvedValue({ id, mail: 'test@example.com' });
    jest
      .spyOn(mailReceiverRepository, 'delete')
      .mockResolvedValue(new DeleteResult());

    const response = await request(app.getHttpServer()).delete(`/mail/${id}`);
    expect(response.status).toBe(200);
  });

  it('should throw NotFoundException if mail receiver not found', async () => {
    const id = 'ea1a2f52-5cf4-44a6-b266-175ee396a18e';
    jest.spyOn(mailReceiverRepository, 'findOneBy').mockResolvedValue(null);

    const response = await request(app.getHttpServer()).delete(`/mail/${id}`);
    expect(response.status).toBe(404);
  });

  afterAll(async () => {
    await app.close();
  });
});
