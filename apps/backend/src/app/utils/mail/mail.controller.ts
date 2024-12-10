import {
  Body,
  Controller,
  Delete,
  Get,
  Logger,
  Param,
  ParseUUIDPipe,
  Post,
} from '@nestjs/common';
import {
  ApiCreatedResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { MailService } from './mail.service';
import { CreateMailReceiverDto } from './dto/createMailReceiver.dto';
import { MailReceiverEntity } from './entity/MailReceiver.entity';

@ApiTags('Mail')
@Controller('mail')
export class MailController {
  readonly logger = new Logger(MailController.name);

  constructor(private readonly mailService: MailService) {}

  @Get()
  @ApiOperation({ summary: 'Returns all Mail Receiver.' })
  @ApiOkResponse()
  async findAll(): Promise<MailReceiverEntity[]> {
    return this.mailService.getAllMailReceiver();
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Removes the mail receiver with the given id.' })
  @ApiOkResponse()
  @ApiNotFoundResponse()
  async findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.mailService.removeMailReceiver(id);
  }

  @Post()
  @ApiOperation({ summary: 'Adds a new Mail Receiver.' })
  @ApiCreatedResponse()
  async create(
    @Body() createMailReceiverDto: CreateMailReceiverDto
  ): Promise<MailReceiverEntity> {
    return this.mailService.addMailReceiver(createMailReceiverDto);
  }
}
