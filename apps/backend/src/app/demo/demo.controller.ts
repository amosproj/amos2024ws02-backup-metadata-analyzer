import {
  Body,
  Controller,
  Get,
  Logger,
  NotFoundException,
  Param,
  Post,
} from '@nestjs/common';
import { ApiOkResponse, ApiOperation } from '@nestjs/swagger';
import { DemoService } from './demo.service';
import { DemoDto } from './dto/Demo.dto';
import { CreateEntryDto } from './dto/CreateEntry.dto';

@Controller('demo')
export class DemoController {
  readonly logger = new Logger(DemoController.name);

  constructor(private readonly demoService: DemoService) {}

  @Get(':entryId')
  async getEntryById(@Param('entryId') entryId: string): Promise<DemoDto> {
    const entryDto = await this.demoService.findOneById(entryId);
    if (!entryDto) {
      throw new NotFoundException();
    }

    return entryDto;
  }

  @Post()
  @ApiOperation({ summary: 'Create a new entry.' })
  @ApiOkResponse({ type: DemoDto })
  async createEntry(@Body() createEntryDto: CreateEntryDto): Promise<DemoDto> {
    return await this.demoService.createEntry(createEntryDto.text);
  }

  @Get('echo/:text')
  @ApiOperation({ summary: 'Echo the given text.' })
  @ApiOkResponse({ type: String })
  async echo(@Param('text') text: string): Promise<string> {
    return await this.demoService.echo(text);
  }
}
