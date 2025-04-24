import { Boom } from '@hapi/boom';
import {
  BadRequestException,
  Injectable,
  PreconditionFailedException,
} from '@nestjs/common';
import makeWASocket, {
  AnyMessageContent,
  BaileysEventMap,
  Browsers,
  ConnectionState,
  fetchLatestBaileysVersion,
  WASocket,
} from 'baileys';

import { SendWhatsAppMessageDTO } from '../../../dtos';
import { WhatsAppClient, WhatsAppClientStatuses } from '../../models';
import { BaileysNestLogger } from './baileys-nest.logger';
import { BaileysRedisAuthStateStore } from './baileys-redis.auth-state-store.class';
import { BaileysIsOnWhatsApp } from './models';

@Injectable()
export class BaileysWhatsAppClient extends WhatsAppClient {
  private _socket: WASocket | null = null;

  private _status: WhatsAppClientStatuses = 'disconnected';

  private _authStateStore: BaileysRedisAuthStateStore;

  private _qrCode: string | null = null;

  private _logger: BaileysNestLogger;

  public async create(whatsAppId: number): Promise<WhatsAppClient> {
    try {
      this._logger = new BaileysNestLogger(whatsAppId);

      this._logger.log(`Creating client...`);

      const { version, isLatest } = await fetchLatestBaileysVersion();

      this._logger.debug(
        `Using WA version ${version.join('.')} that ${isLatest ? 'is' : 'is not'} that latest version available`,
      );

      this._authStateStore = new BaileysRedisAuthStateStore(whatsAppId);

      await this._authStateStore.init();

      this._socket = makeWASocket({
        auth: this._authStateStore.state,
        browser: Browsers.appropriate('Desktop'),
        logger: this._logger,
      });

      this._socket.ev.process(
        async (events: Partial<BaileysEventMap>): Promise<void> => {
          if (events['connection.update']) {
            const eventData: Partial<ConnectionState> =
              events['connection.update'];

            this._logger.debug('Connection updated');

            const { connection, lastDisconnect, qr } = eventData;

            if (qr) {
              this._qrCode = qr;

              this._status = 'pending';

              this._logger.warn(
                `Connection is now pending. QR Code must be read`,
              );
            }

            if (connection === 'close') {
              this._status = 'disconnected';

              const shouldReconnect: boolean =
                (lastDisconnect?.error as Boom).output.statusCode !== 401;

              this._socket = null;

              if (shouldReconnect) {
                this._logger.error(
                  `Connection is now disconnected. Reconnecting...`,
                );

                this.create(whatsAppId)
                  .then((value: WhatsAppClient) => Object.assign(this, value))
                  .catch((error: unknown) => {
                    throw error;
                  });
              }

              this._logger.error(`Connection is now disconnected`);
            }

            if (connection === 'open') {
              this._status = 'connected';

              this._qrCode = null;

              this._logger.log('Connection is now connected');
            }
          }
          if (events['creds.update']) {
            await this._authStateStore.saveCreds();
          }
        },
      );

      this._logger.log(`Client successfully created`);

      return this;
    } catch (error) {
      this._status = 'disconnected';

      this._logger.error(error, 'Error while creating client');

      throw error;
    }
  }

  public async disconnect(): Promise<void> {
    if (this._socket) {
      await this._socket.logout();

      this._socket = null;

      this._status = 'disconnected';
    }
  }

  public getStatus(): WhatsAppClientStatuses {
    return this._status;
  }

  public getQrCode(): string | null {
    return this._qrCode;
  }

  public async sendMessage(dto: SendWhatsAppMessageDTO): Promise<void> {
    if (!this._socket) {
      throw new PreconditionFailedException(
        `There is no WhatsApp client available`,
      );
    }

    if (!dto.message && !dto.attachments?.length) {
      throw new BadRequestException(`You must provide message or attachments`);
    }

    const jid: string = await this._getJid(dto.phone);

    if (dto.message && !dto.attachments?.length) {
      await this._socket.sendMessage(jid, {
        text: dto.message,
      });
    } else if (!dto.message && dto.attachments?.length) {
      for (const curAttachment of dto.attachments) {
        await this._socket.sendMessage(
          jid,
          this._createMessageOptions(curAttachment),
        );
      }
    } else if (dto.message && dto.attachments?.length) {
      await this._socket.sendMessage(jid, {
        text: dto.message,
      });

      for (const curAttachment of dto.attachments) {
        await this._socket.sendMessage(
          jid,
          this._createMessageOptions(curAttachment),
        );
      }
    }
  }

  private async _getJid(phone: string): Promise<string> {
    if (!this._socket) {
      throw new PreconditionFailedException(
        `There is no WhatsApp client available`,
      );
    }

    const jid: string = this._parseToJid(phone);

    const isOnWhatsApp: BaileysIsOnWhatsApp[] | undefined =
      await this._socket.onWhatsApp(jid);

    if (!isOnWhatsApp || !isOnWhatsApp.length) {
      throw new BadRequestException(
        `The provided phone number is not on WhatsApp`,
      );
    }

    return isOnWhatsApp[0].jid;
  }

  private _parseToJid(phone: string): string {
    return `${phone}@s.whatsapp.net`;
  }

  private _createMessageOptions(
    attachment: Express.Multer.File,
  ): AnyMessageContent {
    const mimeTypeParts: string[] = attachment.mimetype.split('/');

    const type: string = mimeTypeParts[0];

    let options: AnyMessageContent;

    if (type === 'image') {
      options = {
        image: attachment.buffer,
      };
    } else if (type === 'video') {
      options = {
        video: attachment.buffer,
        fileName: attachment.originalname,
      };
    } else if (type === 'document') {
      options = {
        document: attachment.buffer,
        fileName: attachment.originalname,
        mimetype: attachment.mimetype,
      };
    } else {
      options = {
        document: attachment.buffer,
        fileName: attachment.originalname,
        mimetype: attachment.mimetype,
      };
    }

    return options;
  }
}
