import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { AnalyzerServiceService } from './analyzer-service.service';

@Module({
  providers: [AnalyzerServiceService],
  imports: [HttpModule],
  exports: [AnalyzerServiceService],
})
export class AnalyzerServiceModule {}
