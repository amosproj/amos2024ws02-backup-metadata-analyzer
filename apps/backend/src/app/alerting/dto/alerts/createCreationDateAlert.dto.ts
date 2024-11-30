import { ApiProperty } from '@nestjs/swagger';

export class CreateCreationDateAlertDto {
  @ApiProperty({
    description: 'Id of the belonging Backup',
    required: true,
  })
  backupId!: string;

  //TODO: Add properties
}
