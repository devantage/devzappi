import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional } from 'class-validator';

import { IsNotBlank } from '../../shared/validation';

export class UpdateWhatsAppDTO {
  @ApiPropertyOptional({ description: 'nome' })
  @IsOptional()
  @IsNotBlank()
  public readonly name?: string;
}
