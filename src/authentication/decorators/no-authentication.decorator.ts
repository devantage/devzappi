import { CustomDecorator, SetMetadata } from '@nestjs/common';

export const NO_AUTHENTICATION_META: string = 'NO_AUTHENTICATION_META';

export const NoAuthentication = (): CustomDecorator =>
  SetMetadata(NO_AUTHENTICATION_META, true);
