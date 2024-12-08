import {
  Body,
  Controller,
  Get,
  Logger,
  NotFoundException,
  Param,
  Post,
  Query,
} from '@nestjs/common';
import {
  ApiBody,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { BackupDataService } from './backupData.service';
import { BackupDataDto } from './dto/backupData.dto';
import { CreateBackupDataDto } from './dto/createBackupData.dto';
import { PaginationDto } from '../utils/pagination/PaginationDto';
import { PaginationOptionsDto } from '../utils/pagination/PaginationOptionsDto';
import { BackupDataFilterDto } from './dto/backupDataFilter.dto';
import { BackupDataOrderOptionsDto } from './dto/backupDataOrderOptions.dto';
import { BackupDataFilterByTaskIdsDto } from './dto/backupDataFilterByTaskIds.dto';

@ApiTags('Backup Data')
@Controller('backupData')
export class BackupDataController {
  readonly logger = new Logger(BackupDataController.name);

  constructor(private readonly backupDataService: BackupDataService) {}

  @Get(':id')
  @ApiOperation({ summary: 'Returns the backupData Object with the given id.' })
  @ApiOkResponse({ type: BackupDataDto })
  async getById(@Param('id') id: string): Promise<BackupDataDto> {
    const entity = await this.backupDataService.findOneById(id);
    if (!entity) {
      throw new NotFoundException();
    }

    return entity;
  }

  @Post('filter')
  @ApiOperation({ summary: 'Returns all backupData Objects.' })
  @ApiOkResponse()
  @ApiBody({
    type: BackupDataFilterByTaskIdsDto,
    required: false,
  })
  async findAll(
    @Query() paginationOptionsDto: PaginationOptionsDto,
    @Query() backupDataFilterDto: BackupDataFilterDto,
    @Query() backupDataOrderOptionsDto: BackupDataOrderOptionsDto,
    @Body() backupDataFilterByTaskIdsDto?: BackupDataFilterByTaskIdsDto
  ): Promise<PaginationDto<BackupDataDto>> {
    return this.backupDataService.findAll(
      paginationOptionsDto,
      backupDataOrderOptionsDto,
      backupDataFilterDto,
      backupDataFilterByTaskIdsDto
    );
  }

  @Post()
  @ApiOperation({ summary: 'Creates a new backupData Object.' })
  @ApiCreatedResponse({
    type: BackupDataDto,
    description: 'The created Backup Data Object.',
  })
  async create(
    @Body() createBackupDataDto: CreateBackupDataDto
  ): Promise<BackupDataDto> {
    return this.backupDataService.create(createBackupDataDto);
  }

  @Post('batched')
  @ApiOperation({ summary: 'Creates new backupData Objects batched.' })
  @ApiCreatedResponse({})
  async createBatched(
    @Body() createBackupDataDtos: CreateBackupDataDto[]
  ): Promise<void> {
    return this.backupDataService.createBatched(createBackupDataDtos);
  }
}
