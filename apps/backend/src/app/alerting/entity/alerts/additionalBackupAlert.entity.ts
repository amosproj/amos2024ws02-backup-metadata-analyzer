import { Column, Entity } from 'typeorm';
import { Alert } from './alert';
import { ApiProperty } from '@nestjs/swagger';

@Entity('AdditionalBackupAlert')
export class AdditionalBackupAlertEntity extends Alert {
  @ApiProperty({
    description: 'Date, the backup started',
  })
  @Column()
  date!: Date;
}
