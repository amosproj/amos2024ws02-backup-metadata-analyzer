import {Body, Controller, Get, Logger, NotFoundException, Param, Post,} from '@nestjs/common';
import {ApiCreatedResponse, ApiOkResponse, ApiOperation,} from '@nestjs/swagger';
import {BackupDataService} from "./backupData.service";
import {BackupDataDto} from "./dto/backupData.dto";
import {CreateBackupDataDto} from "./dto/createBackupData.dto";

@Controller('backupData')
export class BackupDataController {
    readonly logger = new Logger(BackupDataController.name);

    constructor(
        private readonly backupDataService: BackupDataService,
    ) {
    }

    @Get(":id")
    @ApiOperation({summary: 'Returns the backupData Object with the given id.'})
    @ApiOkResponse({type: BackupDataDto})
    async getById(
        @Param('id') id: string,
    ): Promise<BackupDataDto> {
        const entity = await this.backupDataService.findOneById(id);
        if (!entity) {
            throw new NotFoundException();
        }

        return entity;
    }

    @Get()
    @ApiOperation({summary: 'Returns all backupData Objects.'})
    @ApiOkResponse({type: [BackupDataDto]})
    async getAll(): Promise<BackupDataDto[]> {
        return this.backupDataService.findAll();
    }
    
    @Post()
    @ApiOperation({summary: 'Creates a new backupData Object.'})
    @ApiCreatedResponse({
        type: BackupDataDto,
        description: 'The created Backup Data Object.',
    })
    async create(
        @Body() createBackupDataDto: CreateBackupDataDto,
    ): Promise<BackupDataDto> {
        return this.backupDataService.create(createBackupDataDto);
    }
}
