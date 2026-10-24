import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { env } from './config/env';
import { DownloadModule } from './modules/download/download.module';
import { HealthModule } from './modules/health/health.module';

@Module({
  imports: [
    // shortcut: limits by req.ip, in memory; behind a reverse proxy enable "trust proxy",
    // and with several API instances move the storage to Redis.
    ThrottlerModule.forRoot({
      throttlers: [{ ttl: 60_000, limit: env.rateLimitPerMinute }],
      errorMessage: 'Too many requests, please try again in a minute',
    }),
    HealthModule,
    DownloadModule,
  ],
  providers: [{ provide: APP_GUARD, useClass: ThrottlerGuard }],
})
export class AppModule {}
