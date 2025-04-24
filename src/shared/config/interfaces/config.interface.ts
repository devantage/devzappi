import { LogLevel } from '@nestjs/common';

export interface Config {
  TZ?: string;
  APP_ENV: 'development' | 'staging' | 'production';
  APP_PORT: string;
  APP_GLOBAL_PREFIX: string;

  APP_LOG_LEVEL: LogLevel;

  AUTHENTICATION_API_KEY: string;

  REDIS_REPOSITORY_HOST: string;
  REDIS_REPOSITORY_PORT: string;
  REDIS_REPOSITORY_PASSWORD: string;
  REDIS_REPOSITORY_DATABASE: string;

  REDIS_SESSIONS_HOST: string;
  REDIS_SESSIONS_PORT: string;
  REDIS_SESSIONS_PASSWORD: string;
  REDIS_SESSIONS_DATABASE: string;
}
