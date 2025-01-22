import { Controller, Logger, Post } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { AnalyzerServiceService } from './analyzer-service.service';

@ApiTags('Analyzer')
@Controller('analyzer')
export class AnalyzerController {
  readonly logger = new Logger(AnalyzerController.name);

  constructor(
    private readonly analyzerServiceService: AnalyzerServiceService
  ) {}

  @Post('refresh')
  @ApiOperation({
    summary:
      'Refresh the analyzer data, by doing all analyzes again and sending results to backend.',
  })
  async refresh(): Promise<void> {
    return await this.analyzerServiceService.triggerAll();
  }
}
