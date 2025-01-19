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
    description: 'Alert History', 
  })
  history?: AlertOcurrence[];

  @ApiProperty({ 
    description: 'Task ID of alert', 
  })
  taskId?: string;

  @ApiProperty({ 
    description: 'Storage ID of alert', 
  })
  storageId?: string;
}

export class AlertOcurrence{
  @ApiProperty({ 
    description: 'Date of alert', 
  })
  date!: Date;

  // only apply for size alerts

  @ApiProperty({ 
    description: 'reference size', 
  })
  referenceSize?: number;

  @ApiProperty({ 
    description: 'size', 
  })
  size?: number;

}

