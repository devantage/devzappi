import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  Post,
  StreamableFile,
  UploadedFiles,
  UseInterceptors,
} from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import {
  ApiConsumes,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';

import { ApiKeyAuth } from '../../authentication';
import {
  CreateWhatsAppDTO,
  GetWhatsAppByIdDTO,
  SendWhatsAppMessageDTO,
} from '../dtos';
import { WhatsApp } from '../entities';
import { WhatsAppsService } from '../services';

@ApiTags("WhatsApp's")
@ApiKeyAuth()
@Controller({
  path: 'whatsapps',
  version: ['1'],
})
export class WhatsAppsController {
  public constructor(private readonly _service: WhatsAppsService) {}

  @ApiOperation({ summary: 'Create a WhatsApp' })
  @ApiCreatedResponse({
    description: 'Created WhatsApp',
    type: () => WhatsApp,
  })
  @Post()
  public async create(@Body() bodyDto: CreateWhatsAppDTO): Promise<WhatsApp> {
    return this._service.create(bodyDto);
  }

  @ApiOperation({
    summary: "Get all WhatsApp's",
  })
  @ApiOkResponse({
    description: "Found WhatsApp's",
    type: () => WhatsApp,
    isArray: true,
  })
  @Get()
  public async getAll(): Promise<WhatsApp[]> {
    return this._service.getAll();
  }

  @ApiOperation({
    summary: 'Get a WhatsApp by ID',
  })
  @ApiOkResponse({
    description: 'Found WhatsApp',
    type: () => WhatsApp,
  })
  @Get(':id')
  public async getById(
    @Param() paramDto: GetWhatsAppByIdDTO,
  ): Promise<WhatsApp> {
    return this._service.getById(paramDto.id);
  }

  @ApiOperation({
    summary: "Get a WhatsApp's QR Code image",
  })
  @ApiOkResponse({
    description: 'QR Code image',
    content: {
      'image/png': {
        schema: {
          type: 'string',
          format: 'binary',
        },
      },
    },
  })
  @Get(':id/qr-code')
  public async getQrCodeImage(
    @Param() paramDto: GetWhatsAppByIdDTO,
  ): Promise<StreamableFile> {
    return this._service.getQrCodeImage(paramDto.id);
  }

  @ApiOperation({
    summary: 'Delete a WhatsApp',
  })
  @ApiOkResponse({
    description: 'WhatsApp deleted',
  })
  @Delete(':id')
  public async delete(@Param() paramDto: GetWhatsAppByIdDTO): Promise<void> {
    await this._service.delete(paramDto.id);
  }

  @ApiOperation({
    summary: 'Send a message',
  })
  @ApiOkResponse({
    description: 'Message sent',
  })
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(FilesInterceptor('attachments'))
  @HttpCode(200)
  @Post(':id/send-message')
  public async sendMessage(
    @Param() paramDto: GetWhatsAppByIdDTO,
    @Body() bodyDto: SendWhatsAppMessageDTO,
    @UploadedFiles() attachments: Express.Multer.File[],
  ): Promise<void> {
    await this._service.sendMessage(paramDto.id, {
      phone: bodyDto.phone,
      message: bodyDto.message,
      attachments,
    });
  }
}
