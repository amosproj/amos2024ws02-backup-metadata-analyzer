import { ApiProperty } from '@nestjs/swagger';
import { AlertTypeEntity } from '../entity/alertType.entity';
import { Alert } from '../entity/alerts/alert';
import { SeverityType } from './severityType';

export class AlertSummaryDto {
 @ApiProperty({ 
    description: 'Number of Info alerts',
})
  infoAlerts?: number;

  @ApiProperty({ 
    description: 'Number of Warning alerts', 
  })
  warningAlerts?: number;

  @ApiProperty({ 
    description: 'Number of Critical alerts',
    })
  criticalAlerts?: number;

  @ApiProperty({ 
    description: 'Total number of alerts', 
  })
  totalCount?: number;

  @ApiProperty({ 
    description: 'List of repeated Alerts', 
  })
  repeatedAlerts?: RepeatedAlertDto[];

  @ApiProperty({ 
    description: 'Most frequent alert', 
  })
  mostFrequentAlert?: RepeatedAlertDto;

};



export class RepeatedAlertDto {
  @ApiProperty({
    description: 'Alert Type',
  })
  type!: AlertTypeEntity;

  @ApiProperty({
    description: 'Severity of the alert',
  })
  severity!: SeverityType;

  @ApiProperty({ 
    description: 'Count of ocurrences', 
  })
  count!: number;

  @ApiProperty({ 
    description: 'Latest Alert', 
  })
  latestAlert?: Alert;

  @ApiProperty({ 
    description: 'First Alert occurence', 
  })
  firstOccurence?: Date;

  @ApiProperty({ 

    description: 'Alert History', 
  })
  history?: AlertOcurrenceDto[];

  @ApiProperty({ 
    description: 'Task ID of alert', 
  })
  taskId?: string;

  @ApiProperty({ 
    description: 'Task Name of alert', 
  })
  taskDisplayName?: string;

  @ApiProperty({ 
    description: 'Storage ID of alert', 
  })
  storageId?: string;
}

export class AlertOcurrenceDto{
  @ApiProperty({ 
    description: 'Date of alert', 
  })
  date!: Date;

  @ApiProperty({ 
    description: 'Alert ID', 
  })
  alertId!: string;
}

