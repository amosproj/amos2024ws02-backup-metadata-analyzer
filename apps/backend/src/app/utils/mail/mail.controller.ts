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
  ApiConflictResponse,
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
  @ApiOkResponse({
    description: 'All Mail Receiver.',
    type: MailReceiverEntity,
    isArray: true,
  })
  async findAll(): Promise<MailReceiverEntity[]> {
    return this.mailService.getAllMailReceiver();
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Removes the mail receiver with the given id.' })
  @ApiOkResponse({
    description: 'The Mail Receiver with the given id has been removed.',
    type: MailReceiverEntity,
  })
  @ApiNotFoundResponse({
    description: 'Mail Receiver with given id not found.',
  })
  async findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.mailService.removeMailReceiver(id);
  }

  @Post()
  @ApiOperation({ summary: 'Adds a new Mail Receiver.' })
  @ApiCreatedResponse({
    description: 'Mail Receiver created successfully.',
    type: MailReceiverEntity,
  })
  @ApiConflictResponse({ description: 'Mail Receiver already exists.' })
  async create(
    @Body() createMailReceiverDto: CreateMailReceiverDto
  ): Promise<MailReceiverEntity> {
    return this.mailService.addMailReceiver(createMailReceiverDto);
  }
}
