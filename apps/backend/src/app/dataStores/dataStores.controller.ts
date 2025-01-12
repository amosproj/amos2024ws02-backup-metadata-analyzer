import {
  Body,
  Controller,
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
import { DataStoresService } from './dataStores.service';
import { CreateDataStoreDto } from './dto/createDataStore.dto';
import { SetOverflowTimeDto } from './dto/setOverflowTime.dto';

@ApiTags('DataStores')
@Controller('dataStores')
export class DataStoresController {
  readonly logger = new Logger(DataStoresController.name);

  constructor(private readonly dataStoresService: DataStoresService) {}

  @Get()
  @ApiOperation({ summary: 'Returns all data stores.' })
  @ApiOkResponse()
  async findAll() {
    return this.dataStoresService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Returns the data store with the given id.' })
  @ApiOkResponse()
  @ApiNotFoundResponse()
  async findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.dataStoresService.findOne(id);
  }

  @Post()
  @ApiOperation({ summary: 'Creates a new data store.' })
  @ApiCreatedResponse()
  async create(@Body() createDataStoreDto: CreateDataStoreDto) {
    return this.dataStoresService.create(createDataStoreDto);
  }

  @Post(':id/setOverflowTime')
  @ApiOperation({ summary: 'Sets the overflow time for a data store.' })
  @ApiOkResponse({ description: 'Overflow time updated successfully.' })
  @ApiNotFoundResponse({ description: 'Data store with given id not found.' })
  async setOverflowTime(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() payload: SetOverflowTimeDto
  ) {
    return this.dataStoresService.setOverflowTime(id, payload.overflowTime);
  }
}
