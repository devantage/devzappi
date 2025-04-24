import {
  ClassSerializerInterceptor,
  Module,
  ValidationPipe,
} from '@nestjs/common';
import { APP_GUARD, APP_INTERCEPTOR, APP_PIPE } from '@nestjs/core';

import { AuthenticationGuard } from './authentication';
import { exceptionFactory } from './shared/validation';
import { WhatsAppsModule } from './whatsapps';

@Module({
  imports: [WhatsAppsModule],
  controllers: [],
  providers: [
    { provide: APP_GUARD, useClass: AuthenticationGuard },
    { provide: APP_INTERCEPTOR, useClass: ClassSerializerInterceptor },
    {
      provide: APP_PIPE,
      useValue: new ValidationPipe({
        whitelist: true,
        validateCustomDecorators: true,
        transform: true,
        exceptionFactory,
      }),
    },
  ],
})
export class AppModule {}
