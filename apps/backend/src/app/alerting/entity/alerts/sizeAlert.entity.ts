import { Column, Entity } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { Alert } from './alert';

@Entity('SizeAlert')
export class SizeAlertEntity extends Alert {
  @ApiProperty({
    description: 'Size of the Backup, which is the reason for the alert',
  })
  @Column({ type: 'decimal', precision: 20, scale: 6 })
  size!: number;

  @ApiProperty({
    description:
      'Reference size to the value of the Backup, in which comparison the alert was triggered',
  })
  @Column({ type: 'decimal', precision: 20, scale: 6 })
  referenceSize!: number;
}
