import { Module } from '@nestjs/common';
import { DemoService } from './demo.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DemoEntity } from './entity/demo.entity';
import { DemoController } from './demo.controller';
import { AnalyzerServiceModule } from '../analyzerService/analyzer-service.module';

@Module({
  providers: [DemoService],
  imports: [TypeOrmModule.forFeature([DemoEntity]), AnalyzerServiceModule],
  controllers: [DemoController],
  exports: [DemoService],
})
export class DemoModule {}
