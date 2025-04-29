import { ApiSecurity } from '@nestjs/swagger';

export const ApiKeyAuth: () => ClassDecorator & MethodDecorator = () =>
  ApiSecurity('apiKey');
