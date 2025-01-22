import {
  Body,
  Controller,
  Get,
  Logger,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import {
  ApiBody,
  ApiConflictResponse, ApiCreatedResponse, ApiNoContentResponse,
  ApiNotFoundResponse,
  ApiOperation,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { AlertingService } from './alerting.service';
import { CreateAlertTypeDto } from './dto/createAlertType.dto';
import { AlertTypeEntity } from './entity/alertType.entity';
import { CreateSizeAlertDto } from './dto/alerts/createSizeAlert.dto';
import { Alert } from './entity/alerts/alert';
import { BackupType } from '../backupData/dto/backupType';
import { CreateCreationDateAlertDto } from './dto/alerts/createCreationDateAlert.dto';
import { AlertStatusDto } from './dto/alertStatus.dto';
import { CreateStorageFillAlertDto } from './dto/alerts/createStorageFillAlert.dto';
import { PaginationOptionsDto } from '../utils/pagination/PaginationOptionsDto';
import { AlertFilterDto } from './dto/alertFilter.dto';
import { AlertOrderOptionsDto } from './dto/alertOrderOptions.dto';
import { PaginationDto } from '../utils/pagination/PaginationDto';
import { AlertStatisticsDto } from './dto/alertStatistics.dto';
import { AlertSummaryDto } from './dto/alertSummary';

@ApiTags('Alerting')
@Controller('alerting')
export class AlertingController {
  readonly logger = new Logger(AlertingController.name);

  constructor(private readonly alertingService: AlertingService) {}

  @Get('statistics')
  @ApiOperation({
    summary: 'Returns the number of Info, Warning and Critical alerts.',
  })
  @ApiResponse({
    status: 200,
    description: 'The number of Info, Warning and Critical alerts.',
    type: AlertStatisticsDto,
  })
  async getStatistics(): Promise<AlertStatisticsDto> {
    return this.alertingService.getStatistics();
  }

  @Get('repetitions')
  @ApiOperation({
    summary: 'Returns Information about repeated Alerts.',
  })
  @ApiResponse({
    status: 200,
    description: 'The number of Info, Warning and Critical alerts.',
  })
  async getTestRepetitions(): Promise<AlertSummaryDto> {
    return this.alertingService.getRepetitions();
  }


  @Post('type')
  @ApiOperation({ summary: 'Create a new alert type.' })
  @ApiConflictResponse({ description: 'Alert type already exists' })
  @ApiBody({ type: CreateAlertTypeDto })
  async createAlertType(@Body() createAlertTypeDto: CreateAlertTypeDto) {
    await this.alertingService.createAlertType(createAlertTypeDto);
  }

  @Patch('type/:alertTypeId/user')
  @ApiOperation({ summary: 'Activate Alert Type by user.' })
  @ApiNotFoundResponse({ description: 'Alert type not found' })
  @ApiBody({ type: AlertStatusDto })
  @ApiNoContentResponse({ description: 'Alert Type Status changed' })
  async userChangeActiveStatusAlertType(
    @Param('alertTypeId') alertTypeId: string,
    @Body() alertStatusDto: AlertStatusDto
  ) {
    await this.alertingService.userChangeActiveStatusAlertType(
      alertTypeId,
      alertStatusDto.status
    );
  }

  @Patch('type/:alertTypeId/admin')
  @ApiOperation({ summary: 'Activate Alert Type by admin.' })
  @ApiNotFoundResponse({ description: 'Alert type not found' })
  @ApiBody({ type: AlertStatusDto })
  @ApiNoContentResponse({ description: 'Alert Type Status changed' })
  async adminChangeActiveStatusAlertType(
    @Param('alertTypeId') alertTypeId: string,
    @Body() alertStatusDto: AlertStatusDto
  ) {
    await this.alertingService.adminChangeActiveStatusAlertType(
      alertTypeId,
      alertStatusDto.status
    );
  }

  @Get('type')
  @ApiOperation({ summary: 'Get all alert types.' })
  @ApiQuery({
    name: 'user_active',
    description: 'Filter alert types by user active',
    required: false,
    type: Boolean,
  })
  @ApiQuery({
    name: 'master_active',
    description: 'Filter alert types by master active',
    required: false,
    type: Boolean,
  })
  @ApiResponse({
    status: 200,
    description: 'Returns all alert types.',
    type: AlertTypeEntity,
    isArray: true,
  })
  async getAllAlertTypes(
    @Query('user_active') user_active?: boolean,
    @Query('master_active') master_active?: boolean
  ): Promise<AlertTypeEntity[]> {
    return this.alertingService.findAllAlertTypes(user_active, master_active);
  }

  @Get()
  @ApiOperation({ summary: 'Returns all alert Objects paginated.' })
  @ApiResponse({
    status: 200,
    description: 'Returns all alert Objects paginated.',
    type: Alert,
    isArray: true,
  })
  async findAll(
    @Query() paginationOptionsDto: PaginationOptionsDto,
    @Query() alertFilterDto: AlertFilterDto,
    @Query() backupDataOrderOptionsDto: AlertOrderOptionsDto
  ): Promise<PaginationDto<Alert>> {
    return this.alertingService.getAllAlertsPaginated(
      paginationOptionsDto,
      backupDataOrderOptionsDto,
      alertFilterDto
    );
  }

  @Post('size/batched')
  @ApiOperation({ summary: 'Creates multiple new size alerts batched.' })
  @ApiNotFoundResponse({ description: 'Backup not found' })
  @ApiCreatedResponse({ description: 'Size Alerts created' })
  @ApiBody({ type: CreateSizeAlertDto })
  async createSizeAlertsBatched(
    @Body() createSizeAlertDtos: CreateSizeAlertDto[]
  ): Promise<void> {
    await this.alertingService.createSizeAlertsBatched(createSizeAlertDtos);
  }

  @Post('creationDate/batched')
  @ApiOperation({
    summary: 'Create multiple new creation Date alerts batched.',
  })
  @ApiNotFoundResponse({ description: 'Backup not found' })
  @ApiCreatedResponse({ description: 'Creation Date Alerts created' })
  @ApiBody({ type: CreateCreationDateAlertDto })
  async createCreationDateAlertsBatched(
    @Body() createCreationDateAlertDtos: CreateCreationDateAlertDto[]
  ): Promise<void> {
    await this.alertingService.createCreationDateAlertsBatched(
      createCreationDateAlertDtos
    );
  }

  @Post('storageFill')
  @ApiOperation({
    summary:
      'Creates new storage fill alerts. (All alerts have to be sent at once)',
  })
  @ApiCreatedResponse({ description: 'Storage Fill Alerts created' })
  @ApiBody({ type: CreateStorageFillAlertDto })
  async storageFillAlert(
    @Body() createStorageFillAlertDtos: CreateStorageFillAlertDto[]
  ): Promise<void> {
    await this.alertingService.createStorageFillAlerts(
      createStorageFillAlertDtos
    );
  }

  @Get('type/:typeName/latest')
  @ApiOperation({
    summary:
      'Gets the id of the backup with the latest alert of the given type.',
  })
  @ApiNotFoundResponse({ description: 'Alert type not found' })
  @ApiResponse({
    status: 200,
    description: 'Returns the backupId of the latest alert of the given type.',
    type: String,
  })
  @ApiQuery({
    name: 'backupType',
    description: 'Filter by backup type',
    required: false,
    enum: BackupType,
  })
  async getBackupDateFromLatestAlert(
    @Param('typeName') typeName: string,
    @Query('backupType') backupType?: BackupType
  ): Promise<string | null> {
    return this.alertingService.getLatestAlertsBackup(typeName, backupType);
  }
}
