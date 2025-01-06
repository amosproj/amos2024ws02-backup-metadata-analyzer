import { Controller, Get, Logger, Param, Post } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { AnalyzerServiceService } from './analyzer-service.service';

@ApiTags('Analyzer')
@Controller('analyzer')
export class AnalyzerController {
  readonly logger = new Logger(AnalyzerController.name);

  constructor(
    private readonly analyzerServiceService: AnalyzerServiceService
  ) {}

  @Post('refresh')
  @ApiOperation({ summary: 'Refresh the analyzer data, by doing all analyzes again and sending results to backend.' })
  async refresh(): Promise<void> {
    return await this.analyzerServiceService.triggerAll();
  }

  //DEMOS
  @Get('echo/:text')
  @ApiOperation({ summary: 'Echo the given text.' })
  @ApiOkResponse({ type: String })
  async echo(@Param('text') text: string): Promise<string> {
    return await this.analyzerServiceService.echo(text);
  }

  @Get('analyzerDemo/')
  @ApiOperation({
    summary: 'Demos getting analyzed data from analyzer using the database.',
  })
  @ApiOkResponse({ type: String })
  async analyzerDemo(): Promise<string> {
    return this.analyzerServiceService.analyzerDemo();
  }
}
