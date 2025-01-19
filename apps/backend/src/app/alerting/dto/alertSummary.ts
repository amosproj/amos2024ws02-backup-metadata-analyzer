import { ApiProperty } from '@nestjs/swagger';
import { AlertTypeEntity } from '../entity/alertType.entity';
import { Alert } from '../entity/alerts/alert';
import { SeverityType } from './severityType';

export class AlertSummaryDto {
 @ApiProperty({ 
    description: 'Number of Info alerts',
    example: 0 
})
  infoAlerts?: number;

  @ApiProperty({ 
    description: 'Number of Warning alerts', 
    example: 0
  })
  warningAlerts?: number;

  @ApiProperty({ 
    description: 'Number of Critical alerts',
     example: 0
    })
  criticalAlerts?: number;

  @ApiProperty({ 
    description: 'Total number of alerts', 
    example: 0 
  })
  totalCount?: number;

  @ApiProperty({ 
    description: 'List of repeated Alerts', 
    example: 0 
  })
  repeatedAlerts?: RepeatedAlertDto[];

  @ApiProperty({ 
    description: 'Most frequent alert', 
    example: 0 
  })
  mostFrequentAlert?: RepeatedAlertDto;

};



export class RepeatedAlertDto {
  @ApiProperty({
    description: 'Alert Type',
    example: true,
  })
  type!: AlertTypeEntity;

  @ApiProperty({ 
    description: 'Count of ocurrences', 
    example: 0 
  })
  count!: number;

  @ApiProperty({ 
    description: 'Latest Alert', 
    example: 0 
  })
  latestAlert?: Alert;

  @ApiProperty({ 
    description: 'Alert History', 
    example: 0 
  })
  history?: Date[];

  @ApiProperty({ 
    description: 'Task ID of alert', 
    example: 0 
  })
  taskId?: string;

  @ApiProperty({ 
    description: 'Storage ID of alert', 
    example: 0 
  })
  storageId?: string;
}


export class AlertOccurenceDto {
  @ApiProperty({
    description: 'Date of the alert',
    example: true,
  })
  date!: Date;

  @ApiProperty({ 
    description: 'Details of the alert', 
    example: 0 
  })
  details?: string;

  @ApiProperty({ 
    description: 'Severity of the alert', 
    example: 0 
  })
  severity?: SeverityType;
}

