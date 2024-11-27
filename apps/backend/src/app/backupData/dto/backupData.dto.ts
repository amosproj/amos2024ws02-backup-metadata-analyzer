import {ApiProperty} from '@nestjs/swagger';
import { IsEnum, IsNumber, IsString, IsUUID } from 'class-validator';
import { BackupType } from './backupType';

export class BackupDataDto {
    @ApiProperty({
        description: 'Uuid',
        required: true,
    })
    @IsUUID()
    id!: string;

    @ApiProperty({
        description: 'Size of Backup in MB',
        nullable: false,
        required: true,
    })
    @IsNumber()
    sizeMB!: number;

    @ApiProperty({
        description: 'Backup Type',
        nullable: false,
        required: true,
        enum: BackupType
    })
    @IsEnum(BackupType)
    type!: BackupType;

    @ApiProperty({
        description: 'Creation Date of Backup',
        nullable: false,
        required: true,
    })
    @IsString()
    creationDate!: Date;
}