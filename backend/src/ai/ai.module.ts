import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AiService } from './ai.service';
import { AiEvaluation } from './ai-evaluation.entity';

@Module({
  imports: [TypeOrmModule.forFeature([AiEvaluation])],
  providers: [AiService],
  exports: [AiService],
})
export class AiModule {}
