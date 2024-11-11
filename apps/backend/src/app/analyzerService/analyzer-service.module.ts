import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { AnalyzerServiceService } from './analyzer-service.service';
import { AnalyzerController } from './analyzer.controller';

@Module({
  providers: [AnalyzerServiceService],
  imports: [HttpModule],
  controllers: [AnalyzerController],
  exports: [AnalyzerServiceService],
})
export class AnalyzerServiceModule {}