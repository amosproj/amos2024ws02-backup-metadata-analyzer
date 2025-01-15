import { ApiProperty } from '@nestjs/swagger';

export class BackupInformationDto {
  @ApiProperty({
    type: 'number',
    description: 'The total size of all backups in MB.',
  })
  totalBackupSize!: number;

  @ApiProperty({
    type: 'number',
    description: 'The number of backups that are stored.',
  })
  numberOfBackups!: number;
}
