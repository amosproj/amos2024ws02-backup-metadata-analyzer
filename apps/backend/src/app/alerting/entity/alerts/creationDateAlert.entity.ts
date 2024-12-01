import { Column, Entity } from 'typeorm';
import { Alert } from './alert';
import { ApiProperty } from '@nestjs/swagger';

@Entity('CreationDateAlert')
export class CreationDateAlertEntity extends Alert {
  @ApiProperty({
    description: 'Date, the backup started',
  })
  @Column()
  date!: Date;

  @ApiProperty({
    description: 'Date, the backup should have been started',
  })
  @Column()
  referenceDate!: Date;
}
