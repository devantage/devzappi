import Redis from 'ioredis';

import { WhatsApp } from '../../entities';
import { WhatsAppsRepository } from '../whatsapps-repository';

export interface RedisWhatsAppsRepositoryConfig {
  redisHost: string;

  redisPort: number;

  redisPassword: string;

  redisDatabase: number;
}

export class RedisWhatsAppsRepository extends WhatsAppsRepository {
  private readonly _redisClient: Redis;

  public constructor(config: RedisWhatsAppsRepositoryConfig) {
    super();

    this._redisClient = new Redis({
      host: config.redisHost,
      port: config.redisPort,
      password: config.redisPassword,
      db: config.redisDatabase,
    });
  }

  public async create(whatsApp: WhatsApp): Promise<WhatsApp> {
    const id: number = await this._getNextId();

    const createdWhatsApp: WhatsApp = new WhatsApp({
      ...whatsApp.toJSON(),
      id,
    });

    await this._redisClient.set(
      `whatsapp-${id.toString()}`,
      JSON.stringify(createdWhatsApp),
    );

    return createdWhatsApp;
  }

  public async findAll(): Promise<WhatsApp[]> {
    const whatsApps: string[] = await this._getByKeyPattern('whatsapp-*');

    return whatsApps.map((curWhatsApp: string) =>
      WhatsApp.fromJSON(JSON.parse(curWhatsApp) as Partial<WhatsApp>),
    );
  }

  public async findById(id: number): Promise<WhatsApp | null> {
    const whatsApp: string | null = await this._redisClient.get(
      `whatsapp-${id.toString()}`,
    );

    if (!whatsApp) {
      return null;
    }

    return WhatsApp.fromJSON(JSON.parse(whatsApp) as Partial<WhatsApp>);
  }

  public async delete(whatsApp: WhatsApp): Promise<void> {
    await this._redisClient.del(`whatsapp-${whatsApp.id.toString()}`);
  }

  private async _getByKeyPattern(pattern: string): Promise<string[]> {
    let cursor: string = '0';

    const keys: string[] = [];

    do {
      const [nextCursor, foundKeys] = await this._redisClient.scan(
        cursor,
        'MATCH',
        pattern,
        'COUNT',
        100,
      );

      cursor = nextCursor;

      keys.push(...foundKeys);
    } while (cursor !== '0');

    if (keys.length === 0) return [];

    const result: (string | null)[] = await this._redisClient.mget(...keys);

    return result.filter((curResult: string | null) => curResult !== null);
  }

  private async _getNextId(): Promise<number> {
    const curId: string | null =
      await this._redisClient.get('whatsapps-cur-id');

    const nextId: number = !curId ? 1 : Number(curId) + 1;

    await this._redisClient.set('whatsapps-cur-id', nextId.toString());

    return nextId;
  }
}
