import { ApiProperty } from '@nestjs/swagger';

export class CreateSizeAlertDto {

  @ApiProperty({
    description: 'Uuid of the Backup',
    required: true,
  })
  backupId!: string;

  @ApiProperty({
    description: 'Size of the Backup, which is the reason for the alert',
  })
  size!: number;

  @ApiProperty({
    description:
      'Reference size to the value of the Backup, in which comparison the alert was triggered',
  })
  referenceSize!: number;
}
