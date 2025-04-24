import { WhatsApp } from '../entities';

export abstract class WhatsAppsRepository {
  public abstract create(whatsApp: WhatsApp): Promise<WhatsApp>;

  public abstract findAll(): Promise<WhatsApp[]>;

  public abstract findById(id: number): Promise<WhatsApp | null>;

  public abstract delete(whatsApp: WhatsApp): Promise<void>;
}
