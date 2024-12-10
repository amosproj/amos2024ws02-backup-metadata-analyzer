import { ApiProperty } from '@nestjs/swagger';
import {
  IsDateString,
  IsEnum,
  IsNumber,
  IsOptional,
  IsUUID,
} from 'class-validator';
import { BackupType } from './backupType';

export class CreateBackupDataDto {
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
    description: 'Backup Type, default is FULL',
    nullable: false,
    required: true,
    enum: BackupType,
    default: BackupType.FULL,
  })
  @IsOptional()
  @IsEnum(BackupType)
  type?: BackupType;

  @ApiProperty({
    description: 'Creation Date of Backup',
    nullable: false,
    required: true,
  })
  @IsDateString({ strict: true })
  creationDate!: Date;

  @ApiProperty({
    description: 'Task Id',
    nullable: true,
    required: false,
  })
  taskId?: string;
}
