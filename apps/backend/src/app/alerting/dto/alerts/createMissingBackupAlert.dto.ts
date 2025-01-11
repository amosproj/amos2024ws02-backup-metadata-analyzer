import { ApiProperty } from '@nestjs/swagger';

export class CreateMissingBackupAlertDto {
  @ApiProperty({
    description: 'Date, the backup should have been started',
    required: true,
  })
  referenceDate!: Date;
}
