import { Logger } from '@nestjs/common';
import { ILogger } from 'baileys/lib/Utils/logger';

export class BaileysNestLogger implements ILogger {
  public level: string;

  private readonly _context: string;

  private readonly _logger: Logger;

  public constructor(whatsAppId: number) {
    this._context = `BaileysWhatsAppSession-${whatsAppId.toString()}`;

    this._logger = new Logger(this._context);
  }

  public child(): ILogger {
    return this;
  }

  public log(obj: unknown, msg?: string): void {
    this._logger.log(this._formatMessage(obj, msg));
  }

  public trace(obj: unknown, msg?: string): void {
    this._logger.debug(this._formatMessage(obj, msg));
  }

  public debug(obj: unknown, msg?: string): void {
    this._logger.debug(this._formatMessage(obj, msg));
  }

  public info(obj: unknown, msg?: string): void {
    this._logger.verbose(this._formatMessage(obj, msg));
  }

  public warn(obj: unknown, msg?: string): void {
    this._logger.warn(this._formatMessage(obj, msg));
  }

  public error(obj: unknown, msg?: string): void {
    this._logger.error(this._formatMessage(obj, msg));
  }

  private _formatMessage(obj: unknown, msg?: string): string {
    const objString: string = this._stringify(obj);

    return msg ? `${msg} | ${objString}` : objString;
  }

  private _stringify(value: unknown): string {
    try {
      if (typeof value === 'string') {
        return value;
      } else {
        return JSON.stringify(value);
      }
    } catch {
      return String(value);
    }
  }
}
