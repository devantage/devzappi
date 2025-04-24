import { BadRequestException, StreamableFile } from '@nestjs/common';
import { ApiProperty } from '@nestjs/swagger';
import { Exclude, Expose } from 'class-transformer';
import { toBuffer } from 'qrcode';

import { SendWhatsAppMessageDTO } from '../dtos';
import { WhatsAppClient, WhatsAppClientStatuses } from '../providers';

export interface WhatsAppProps {
  id?: number;

  name?: string;
}

export class WhatsApp {
  @ApiProperty({
    description: 'ID',
  })
  public id: number;

  @ApiProperty({
    description: 'Name',
  })
  public name: string;

  @ApiProperty({
    description: 'Status',
  })
  @Expose()
  public get status(): WhatsAppClientStatuses {
    return this._getClient().getStatus();
  }

  @Exclude()
  private _client: WhatsAppClient | null;

  public constructor(props: Partial<WhatsAppProps>) {
    Object.assign(this, props);
  }

  public attachClient(client: WhatsAppClient): void {
    this._client = client;
  }

  public detachClient(): void {
    this._client = null;
  }

  private _getClient(): WhatsAppClient {
    if (!this._client) {
      throw new Error('WhatsApp client not attached');
    }

    return this._client;
  }

  public async disconnect(): Promise<void> {
    await this._getClient().disconnect();
  }

  public async getQrCodeImage(): Promise<StreamableFile> {
    const qrCode: string | null = this._getClient().getQrCode();

    if (!qrCode) {
      throw new BadRequestException(
        `Theres no QR Code available to this WhatsApp`,
      );
    }

    return new StreamableFile(await toBuffer(qrCode), {
      type: 'image/png',
    });
  }

  public async sendMessage(dto: SendWhatsAppMessageDTO): Promise<void> {
    await this._getClient().sendMessage(dto);
  }

  public static fromJSON(json: Partial<WhatsAppProps>): WhatsApp {
    return new WhatsApp(json);
  }

  public toJSON(): Partial<WhatsAppProps> {
    return {
      id: this.id,
      name: this.name,
    };
  }
}
