import { ApiProperty } from '@nestjs/swagger';

export class SizeAlertDto {
  @ApiProperty({
    type: 'number',
    description: 'Size of the Backup',
  })
  size!: number;

  @ApiProperty({
    type: 'number',
    description: 'Size of the Backup before',
  })
  referenceSize!: number;
}
