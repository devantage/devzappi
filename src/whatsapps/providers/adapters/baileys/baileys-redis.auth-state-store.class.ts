import {
  AuthenticationCreds,
  AuthenticationState,
  BufferJSON,
  initAuthCreds,
  proto,
  SignalDataSet,
  SignalDataTypeMap,
  SignalKeyStore,
} from 'baileys';
import Redis from 'ioredis';

export class BaileysRedisAuthStateStore {
  private readonly _redisClient: Redis;

  private readonly _prefix: string;

  public state: AuthenticationState = {
    creds: {} as AuthenticationCreds,
    keys: {} as SignalKeyStore,
  };

  public constructor(whatsAppId: number) {
    this._redisClient = new Redis({
      host: process.env.REDIS_SESSIONS_HOST,
      port: Number(process.env.REDIS_SESSIONS_PORT),
      password: process.env.REDIS_SESSIONS_PASSWORD,
      db: Number(process.env.REDIS_SESSIONS_DATABASE),
    });

    this._prefix = `whatsapp-session-${this._normalizeKeyName(whatsAppId.toString())}:`;

    this.state.keys = {
      get: async <T extends keyof SignalDataTypeMap>(
        type: T,
        ids: string[],
      ): Promise<{
        [id: string]: SignalDataTypeMap[T];
      }> => {
        const data: {
          [id: string]: SignalDataTypeMap[T];
        } = {};

        await Promise.all(
          ids.map(async (id: string) => {
            let value: unknown = await this._readData(`${type}-${id}`);

            if (type === 'app-state-sync-key' && value) {
              value = proto.Message.AppStateSyncKeyData.fromObject(value);
            }

            data[id] = value as SignalDataTypeMap[typeof type];
          }),
        );

        return data;
      },
      set: async (data: SignalDataSet): Promise<void> => {
        const tasks: Promise<void>[] = [];

        for (const category in data) {
          const typedCategory: keyof SignalDataTypeMap =
            category as keyof SignalDataTypeMap;

          for (const id in data[typedCategory]) {
            const value: unknown = data[typedCategory][id];

            const key: string = `${category}-${id}`;

            tasks.push(
              value ? this._writeData(value, key) : this._removeData(key),
            );
          }
        }

        await Promise.all(tasks);
      },
    };
  }

  public async init(): Promise<void> {
    this.state.creds =
      ((await this._readData('creds')) as AuthenticationCreds | null) ??
      initAuthCreds();
  }

  public async saveCreds(): Promise<void> {
    await this._writeData(this.state.creds, 'creds');
  }

  private _normalizeKeyName(key?: string): string {
    if (!key) {
      return '';
    }

    return key.replace(/\//g, '__').replace(/:/g, '-');
  }

  private async _writeData(data: unknown, key: string): Promise<void> {
    const redisKey: string = `${this._prefix}${this._normalizeKeyName(key)}`;

    await this._redisClient.set(
      redisKey,
      JSON.stringify(data, BufferJSON.replacer),
    );
  }

  private async _readData(key: string): Promise<unknown> {
    const redisKey: string = `${this._prefix}${this._normalizeKeyName(key)}`;

    const raw: string | null = await this._redisClient.get(redisKey);

    return raw ? JSON.parse(raw, BufferJSON.reviver) : null;
  }

  private async _removeData(key: string): Promise<void> {
    const redisKey: string = `${this._prefix}${this._normalizeKeyName(key)}`;

    await this._redisClient.del(redisKey);
  }
}
