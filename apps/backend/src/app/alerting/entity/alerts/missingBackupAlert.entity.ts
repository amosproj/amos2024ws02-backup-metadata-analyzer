import { Column, Entity } from 'typeorm';
import { Alert } from './alert';
import { ApiProperty } from '@nestjs/swagger';

@Entity('MissingBackupAlert')
export class MissingBackupAlertEntity extends Alert {
  @ApiProperty({
    description: 'Date, the backup should have been started',
  })
  @Column()
  referenceDate!: Date;
}
