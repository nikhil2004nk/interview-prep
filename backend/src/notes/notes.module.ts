import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { NotesService } from './notes.service';
import { NotesController } from './notes.controller';
import { Note } from './note.entity';
import { Tag } from '../tags/tag.entity';
import { Topic } from '../topics/topic.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Note, Tag, Topic])],
  controllers: [NotesController],
  providers: [NotesService],
  exports: [NotesService],
})
export class NotesModule {}
