import { UnauthorizedException } from '@nestjs/common';
import { Request } from 'express';

export function extractApiKeyFromRequest(request: Request): string {
  if (
    request.headers['api-key'] &&
    typeof request.headers['api-key'] === 'string'
  ) {
    return request.headers['api-key'];
  } else {
    throw new UnauthorizedException('Missing or invalid API key');
  }
}
