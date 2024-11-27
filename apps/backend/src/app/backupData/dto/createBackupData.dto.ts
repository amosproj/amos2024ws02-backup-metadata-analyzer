import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNumber, IsOptional, IsString, IsUUID } from 'class-validator';
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
    default: BackupType.FULL
  })
  @IsOptional()
  @IsEnum(BackupType)
  type?: BackupType;

  @ApiProperty({
    description: 'Creation Date of Backup',
    nullable: false,
    required: true,
  })
  @IsString()
  creationDate!: Date;
}
