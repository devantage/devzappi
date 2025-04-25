import {
  Injectable,
  NotFoundException,
  OnModuleInit,
  StreamableFile,
} from '@nestjs/common';

import { CreateWhatsAppDTO, SendWhatsAppMessageDTO } from '../dtos';
import { WhatsApp } from '../entities';
import { WhatsAppClient } from '../providers';
import { WhatsAppsRepository } from '../repositories';

@Injectable()
export class WhatsAppsService implements OnModuleInit {
  private _whatsAppClients: Map<number, WhatsAppClient> = new Map();

  public constructor(
    private readonly _repository: WhatsAppsRepository,
    private readonly _whatsAppClient: WhatsAppClient,
  ) {}

  public async onModuleInit(): Promise<void> {
    const whatsApps: WhatsApp[] = await this.getAll();

    await Promise.all(
      whatsApps.map(async (curWhatsApp: WhatsApp) => {
        await this._attachClient(curWhatsApp);
      }),
    );
  }

  public async create(dto: CreateWhatsAppDTO): Promise<WhatsApp> {
    const whatsApp: WhatsApp = await this._repository.create(new WhatsApp(dto));

    await this._attachClient(whatsApp);

    return whatsApp;
  }

  public async getAll(): Promise<WhatsApp[]> {
    const whatsApps: WhatsApp[] = await this._repository.findAll();

    for (const curWhatsApp of whatsApps) {
      await this._attachClient(curWhatsApp);
    }

    return whatsApps;
  }

  public async getById(id: number): Promise<WhatsApp> {
    const whatsApp: WhatsApp | null = await this._repository.findById(id);

    if (!whatsApp) {
      throw new NotFoundException(`WhatsApp not found by ID ${id.toString()}`);
    }

    await this._attachClient(whatsApp);

    return whatsApp;
  }

  public async getQrCodeImage(id: number): Promise<StreamableFile> {
    const whatsApp: WhatsApp = await this.getById(id);

    return whatsApp.getQrCodeImage();
  }

  public async delete(id: number): Promise<void> {
    const whatsApp: WhatsApp = await this.getById(id);

    await this._removeClient(whatsApp);

    await this._repository.delete(whatsApp);
  }

  public async sendMessage(
    id: number,
    dto: SendWhatsAppMessageDTO,
  ): Promise<void> {
    const whatsApp: WhatsApp = await this.getById(id);

    await whatsApp.sendMessage(dto);
  }

  private async _attachClient(whatsApp: WhatsApp): Promise<void> {
    let client: WhatsAppClient | undefined = this._whatsAppClients.get(
      whatsApp.id,
    );

    if (client) {
      whatsApp.attachClient(client);
    } else {
      client = await this._whatsAppClient.create(whatsApp.id);

      this._whatsAppClients.set(whatsApp.id, client);

      whatsApp.attachClient(client);
    }
  }

  private async _removeClient(
    whatsApp: WhatsApp,
    mustDisconnect: boolean = false,
  ): Promise<void> {
    const client: WhatsAppClient | undefined = this._whatsAppClients.get(
      whatsApp.id,
    );

    if (client) {
      if (mustDisconnect) {
        await client.disconnect();
      }

      this._whatsAppClients.delete(whatsApp.id);

      whatsApp.detachClient();
    }
  }
}
