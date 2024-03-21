import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from './../src/app.module';
import * as path from 'path';
const filePath = path.resolve(__dirname, '../mock/billings.xlsx');

describe('BillingsController (e2e)', () => {
  let app: INestApplication;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterEach(async () => {
    await app.close();
  });

  it('POST /upload should upload file successfully', () => {
    return request(app.getHttpServer())
      .post('/upload')
      .attach('file', filePath)
      .expect(201)
      .expect({ message: 'Arquivo carregado com sucesso!' });
  });

  it('GET /mrr should calculate MRR correctly', () => {
    const start = '2023-01-02T10:52:00.000Z';
    const end = '2023-04-02T10:52:00.000Z';

    return request(app.getHttpServer())
      .get(`/mrr?start=${start}&end=${end}`)
      .expect(200)
      .expect((res) => {
        expect(res.body).toHaveProperty('records');
        expect(res.body).toHaveProperty('total');
        expect(res.body).toHaveProperty('churn');
      });
  });

  it('GET /listing should return paginated billings', () => {
    const page = 1;

    return request(app.getHttpServer())
      .get(`/listing?page=${page}`)
      .expect(200)
      .expect((res) => {
        expect(res.body).toHaveProperty('billings');
        expect(Number(res.body.currentPage)).toBe(page);
        expect(res.body).toHaveProperty('itemsPerPage');
      });
  });
});
