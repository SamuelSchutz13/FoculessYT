import type { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import type { App } from 'supertest/types';
import { AppModule } from '../src/app.module';
import { configureApp } from '../src/app.setup';

// Real downloads need the network and YouTube's cooperation, so they are not tested here.
describe('App (e2e)', () => {
  let app: INestApplication<App>;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({ imports: [AppModule] }).compile();
    app = moduleRef.createNestApplication();
    configureApp(app);
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('GET /api/v1/health', () => {
    return request(app.getHttpServer()).get('/api/v1/health').expect(200).expect({ status: 'ok' });
  });

  it('GET /docs-json exposes the OpenAPI document', async () => {
    const res = await request(app.getHttpServer()).get('/docs-json').expect(200);
    expect(Object.keys(res.body.paths)).toContain('/api/v1/download');
  });

  it('POST /api/v1/download refuses links that are not from YouTube', () => {
    return request(app.getHttpServer())
      .post('/api/v1/download')
      .send({ url: 'https://vimeo.com/123' })
      .expect(400)
      .expect({
        statusCode: 400,
        error: 'Bad Request',
        message: ['url must be a YouTube link'],
      });
  });

  it('POST /api/v1/download rejects an unknown format', async () => {
    const res = await request(app.getHttpServer())
      .post('/api/v1/download')
      .send({ url: 'https://youtu.be/jNQXAC9IVRw', format: 'avi' })
      .expect(400);
    expect(res.body.message).toEqual([expect.stringContaining('format')]);
  });
});
