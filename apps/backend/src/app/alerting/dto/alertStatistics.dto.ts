import { ApiProperty } from '@nestjs/swagger';

export class AlertStatisticsDto {
  @ApiProperty({ description: 'Number of Info alerts', example: 0 })
  infoAlerts!: number;

  @ApiProperty({ description: 'Number of Warning alerts', example: 0 })
  warningAlerts!: number;

  @ApiProperty({ description: 'Number of Critical alerts', example: 0 })
  criticalAlerts!: number;
}
