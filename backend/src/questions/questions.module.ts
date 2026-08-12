import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { QuestionsService } from './questions.service';
import { QuestionsController } from './questions.controller';
import { Question } from './question.entity';
import { Tag } from '../tags/tag.entity';
import { Topic } from '../topics/topic.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Question, Tag, Topic])],
  controllers: [QuestionsController],
  providers: [QuestionsService],
  exports: [QuestionsService],
})
export class QuestionsModule {}
