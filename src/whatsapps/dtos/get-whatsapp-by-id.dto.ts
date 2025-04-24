import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsNumber } from 'class-validator';

export class GetWhatsAppByIdDTO {
  @ApiProperty({ description: 'ID' })
  @IsNumber()
  @Type(() => Number)
  public readonly id: number;
}
