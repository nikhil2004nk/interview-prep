import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RevisionService } from './revision.service';
import { RevisionController } from './revision.controller';
import { RevisionRecord } from './revision-record.entity';
import { Note } from '../notes/note.entity';
import { Question } from '../questions/question.entity';

@Module({
  imports: [TypeOrmModule.forFeature([RevisionRecord, Note, Question])],
  controllers: [RevisionController],
  providers: [RevisionService],
  exports: [RevisionService],
})
export class RevisionModule {}
