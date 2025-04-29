import { EnvConfig } from '../shared/config';

declare global {
  namespace NodeJS {
    interface ProcessEnv extends EnvConfig {
      NODE_ENV: 'development' | 'staging' | 'production';
    }
  }
}

export {};
