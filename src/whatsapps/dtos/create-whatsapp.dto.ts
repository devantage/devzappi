import { ApiProperty } from '@nestjs/swagger';

import { IsNotBlank } from '../../shared/validation';

export class CreateWhatsAppDTO {
  @ApiProperty({ description: 'nome' })
  @IsNotBlank()
  public readonly name: string;
}
