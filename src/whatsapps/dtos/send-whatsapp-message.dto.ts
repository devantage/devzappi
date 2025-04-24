import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNumberString, ValidateIf } from 'class-validator';

import { IsNotBlank } from '../../shared/validation';

export class SendWhatsAppMessageDTO {
  @ApiProperty({ description: 'Telefone' })
  @IsNumberString()
  public readonly phone: string;

  @ApiPropertyOptional({ description: 'Mensagem' })
  @ValidateIf(
    (dto: SendWhatsAppMessageDTO) =>
      !dto.attachments || !dto.attachments.length,
  )
  @IsNotBlank()
  public readonly message?: string;

  @ApiPropertyOptional({
    description: 'Anexos',
    type: String,
    format: 'binary',
    isArray: true,
  })
  public readonly attachments?: Express.Multer.File[];
}
