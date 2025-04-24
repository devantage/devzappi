import { SendWhatsAppMessageDTO } from '../../dtos';
import { WhatsAppClientStatuses } from './whatsapp-client-statuses.type';

export abstract class WhatsAppClient {
  public abstract create(whatsAppId: number): Promise<WhatsAppClient>;

  public abstract disconnect(): Promise<void>;

  public abstract getStatus(): WhatsAppClientStatuses;

  public abstract getQrCode(): string | null;

  public abstract sendMessage(message: SendWhatsAppMessageDTO): Promise<void>;
}
