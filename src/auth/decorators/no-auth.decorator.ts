import { CustomDecorator, SetMetadata } from '@nestjs/common';

export const NO_AUTH_META: string = 'NO_AUTH_META';

export const NoAuth = (): CustomDecorator => SetMetadata(NO_AUTH_META, true);
