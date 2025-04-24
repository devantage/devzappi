import { Module } from '@nestjs/common';

import { WhatsAppsController } from './controllers';
import { BaileysWhatsAppClient, WhatsAppClient } from './providers';
import { RedisWhatsAppsRepository, WhatsAppsRepository } from './repositories';
import { WhatsAppsService } from './services';

@Module({
  imports: [],
  controllers: [WhatsAppsController],
  providers: [
    {
      provide: WhatsAppsRepository,
      useFactory: (): WhatsAppsRepository =>
        new RedisWhatsAppsRepository({
          redisHost: process.env.REDIS_REPOSITORY_HOST,
          redisPort: Number(process.env.REDIS_REPOSITORY_PORT),
          redisPassword: process.env.REDIS_REPOSITORY_PASSWORD,
          redisDatabase: Number(process.env.REDIS_REPOSITORY_DATABASE),
        }),
    },
    {
      provide: WhatsAppClient,
      useClass: BaileysWhatsAppClient,
    },
    WhatsAppsService,
  ],
  exports: [],
})
export class WhatsAppsModule {}
