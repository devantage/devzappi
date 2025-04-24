import { LogLevel } from '@nestjs/common';

const logLevelsMapping: Record<LogLevel, LogLevel[]> = {
  fatal: ['fatal'],
  error: ['fatal', 'error'],
  warn: ['fatal', 'error', 'warn'],
  log: ['fatal', 'error', 'warn', 'log'],
  debug: ['fatal', 'error', 'warn', 'log', 'debug'],
  verbose: ['fatal', 'error', 'warn', 'log', 'debug', 'verbose'],
};

export function getLogLevels(logLevel: LogLevel): LogLevel[] {
  return logLevelsMapping[logLevel];
}
