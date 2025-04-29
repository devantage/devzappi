type Color = 'white' | 'green' | 'yellow' | 'red';

type LogLevel = 'LOG' | 'ERROR';

export class BootstrapLogger {
  private _colors: Record<Color, string> = {
    white: '\x1b[37m',
    green: '\x1b[32m',
    yellow: '\x1b[33m',
    red: '\x1b[31m',
  };

  public constructor(
    private readonly _prefix: string,
    private readonly _context: string,
  ) {}

  public log(message: string): void {
    console.log(this._formatMessage(message, 'LOG'));
  }

  public error(message: string): void {
    console.error(this._formatMessage(message, 'ERROR'));
  }

  private _formatMessage(message: string, level: LogLevel): string {
    return `${this._getPrefix(level)} ${this._paintLevel(message, level)}`;
  }

  private _getPrefix(level: LogLevel): string {
    const prefix: string = `${this._prefix} ${this._getPidPrefix(level)}  - ${this._getTimestampPrefix()} ${this._getLevelPrefix(level)} ${this._getContextPrefix()}`;

    return this._paintLevel(prefix, level);
  }

  private _getPidPrefix(level: LogLevel): string {
    const prefix: string = process.pid.toString();

    return this._paintLevel(prefix, level);
  }

  private _getTimestampPrefix(): string {
    const date: Date = new Date();

    const stringDate: string = date.toLocaleString(undefined, {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      second: '2-digit',
    });

    return this._paint(stringDate, 'white');
  }

  private _getLevelPrefix(level: LogLevel): string {
    let prefix: string = level;

    let lengthDiff: number = 7 - prefix.length;

    while (lengthDiff) {
      prefix = ` ${prefix}`;

      lengthDiff--;
    }

    return this._paintLevel(prefix, level);
  }

  private _getContextPrefix(): string {
    return this._paint(`[${this._context}]`, 'yellow');
  }

  private _paintLevel(text: string, level: LogLevel): string {
    return this._paint(text, this._getLevelColor(level));
  }

  private _getLevelColor(level: LogLevel): Color {
    switch (level) {
      case 'LOG':
        return 'green';
      case 'ERROR':
        return 'red';
    }
  }

  private _paint(text: string, color: Color): string {
    return `${this._getColor(color)}${text}`;
  }

  private _getColor(color: Color): string {
    return this._colors[color];
  }
}
