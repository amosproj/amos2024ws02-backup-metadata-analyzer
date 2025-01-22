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
import { CreateBackupDataDto } from './dto/createBackupData.dto';
import { PaginationDto } from '../utils/pagination/PaginationDto';
import { PaginationOptionsDto } from '../utils/pagination/PaginationOptionsDto';
import { BackupDataFilterDto } from './dto/backupDataFilter.dto';
import { BackupDataOrderOptionsDto } from './dto/backupDataOrderOptions.dto';
import { BackupDataEntity } from './entity/backupData.entity';
import { BackupDataFilterByTaskIdsDto } from './dto/backupDataFilterByTaskIds.dto';

@ApiTags('Backup Data')
@Controller('backupData')
export class BackupDataController {
  readonly logger = new Logger(BackupDataController.name);

  constructor(private readonly backupDataService: BackupDataService) {}

  @Get('latest')
  @ApiOperation({ summary: 'Returns the latest backupData Object.' })
  @ApiOkResponse({
    description: 'The latest Backup Data Object.',
    type: BackupDataEntity,
  })
  async getLatest(): Promise<BackupDataEntity | null> {
    return this.backupDataService.findLatest();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Returns the backupData Object with the given id.' })
  @ApiOkResponse({
    description: 'The Backup Data Object with the given id.',
    type: BackupDataEntity,
  })
  async getById(@Param('id') id: string): Promise<BackupDataEntity> {
    const entity = await this.backupDataService.findOneById(id);
    if (!entity) {
      throw new NotFoundException();
    }

    return entity;
  }

  @Post('filter')
  @ApiOperation({ summary: 'Returns all backupData Objects.' })
  @ApiOkResponse({
    description: 'All Backup Data Objects.',
    type: BackupDataEntity,
    isArray: true,
  })
  @ApiBody({
    type: BackupDataFilterByTaskIdsDto,
    required: false,
  })
  async findAll(
    @Query() paginationOptionsDto: PaginationOptionsDto,
    @Query() backupDataFilterDto: BackupDataFilterDto,
    @Query() backupDataOrderOptionsDto: BackupDataOrderOptionsDto,
    @Body() backupDataFilterByTaskIdsDto?: BackupDataFilterByTaskIdsDto
  ): Promise<PaginationDto<BackupDataEntity>> {
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
    type: BackupDataEntity,
    description: 'The created Backup Data Object.',
  })
  async create(
    @Body() createBackupDataDto: CreateBackupDataDto
  ): Promise<BackupDataEntity> {
    return this.backupDataService.create(createBackupDataDto);
  }

  @Post('batched')
  @ApiOperation({ summary: 'Creates new backupData Objects batched.' })
  @ApiCreatedResponse({
    description: 'Created Backup Data Objects.',
  })
  async createBatched(
    @Body() createBackupDataDtos: CreateBackupDataDto[]
  ): Promise<void> {
    return this.backupDataService.createBatched(createBackupDataDtos);
  }
}
