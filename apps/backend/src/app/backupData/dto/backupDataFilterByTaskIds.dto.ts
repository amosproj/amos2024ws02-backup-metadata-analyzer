import { ApiProperty } from '@nestjs/swagger';
import { IsOptional } from 'class-validator';

export class BackupDataFilterByTaskIdsDto {
  @ApiProperty({
    description: 'Array of task ids to be filtered by',
  })
  @IsOptional()
  taskIds?: string[];
}
