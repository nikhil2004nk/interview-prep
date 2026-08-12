import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AnswersService } from './answers.service';
import { AnswersController } from './answers.controller';
import { Answer } from './answer.entity';
import { Question } from '../questions/question.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Answer, Question])],
  controllers: [AnswersController],
  providers: [AnswersService],
  exports: [AnswersService],
})
export class AnswersModule {}
