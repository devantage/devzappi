import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Request } from 'express';

import { NO_AUTH_META } from '../decorators';
import { extractApiKeyFromRequest } from '../utils';

@Injectable()
export class ApiKeyAuthGuard implements CanActivate {
  public constructor(private readonly reflector: Reflector) {}

  public canActivate(context: ExecutionContext): boolean {
    const noAuth: boolean | undefined = this.reflector.getAllAndOverride(
      NO_AUTH_META,
      [context.getHandler(), context.getClass()],
    );

    if (noAuth) {
      return true;
    }

    const request: Request = context.switchToHttp().getRequest();

    const apiKey: string = extractApiKeyFromRequest(request);

    if (apiKey !== process.env.APP_AUTH_KEY) {
      throw new UnauthorizedException('Missing or invalid API key');
    }

    return true;
  }
}
