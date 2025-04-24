import { Config } from '../shared/config';

declare global {
  namespace NodeJS {
    interface ProcessEnv extends Config {
      NODE_ENV: 'development' | 'staging' | 'production';
    }
  }
}

export {};
