import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Request } from 'express';

import { NO_AUTHENTICATION_META } from '../decorators';
import { extractApiKeyFromRequest } from '../utils';

@Injectable()
export class AuthenticationGuard implements CanActivate {
  public constructor(private readonly reflector: Reflector) {}

  public canActivate(context: ExecutionContext): boolean {
    const noAuthentication: boolean | undefined =
      this.reflector.getAllAndOverride(NO_AUTHENTICATION_META, [
        context.getHandler(),
        context.getClass(),
      ]);

    if (noAuthentication) {
      return true;
    }

    const request: Request = context.switchToHttp().getRequest();

    const apiKey: string = extractApiKeyFromRequest(request);

    if (apiKey !== process.env.AUTHENTICATION_API_KEY) {
      throw new UnauthorizedException('Missing or invalid API key');
    }

    return true;
  }
}
