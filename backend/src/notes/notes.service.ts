import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Note } from './note.entity';
import { Tag } from '../tags/tag.entity';
import { Topic } from '../topics/topic.entity';
import { User } from '../users/user.entity';
import { CreateNoteDto } from './dto/create-note.dto';
import { UpdateNoteDto } from './dto/update-note.dto';

@Injectable()
export class NotesService {
  constructor(
    @InjectRepository(Note)
    private readonly notesRepository: Repository<Note>,
    @InjectRepository(Tag)
    private readonly tagsRepository: Repository<Tag>,
    @InjectRepository(Topic)
    private readonly topicsRepository: Repository<Topic>,
  ) {}

  private async getOrCreateTags(tagNames?: string[]): Promise<Tag[]> {
    const tags: Tag[] = [];
    if (tagNames && tagNames.length > 0) {
      for (const name of tagNames) {
        const cleanedName = name.trim().toLowerCase();
        if (!cleanedName) continue;
        
        let tag = await this.tagsRepository.findOne({ where: { name: cleanedName } });
        if (!tag) {
          tag = this.tagsRepository.create({ name: cleanedName });
          tag = await this.tagsRepository.save(tag);
        }
        tags.push(tag);
      }
    }
    return tags;
  }

  async create(user: User, createNoteDto: CreateNoteDto): Promise<Note> {
    const { title, content, topicId, tagNames } = createNoteDto;
    
    let topic = undefined;
    if (topicId) {
      const foundTopic = await this.topicsRepository.findOne({ where: { id: topicId } });
      if (!foundTopic) {
        throw new NotFoundException('Topic not found');
      }
      topic = foundTopic;
    }

    const tags = await this.getOrCreateTags(tagNames);

    const note = this.notesRepository.create({
      title,
      content,
      user,
      topic,
      tags,
    });

    return this.notesRepository.save(note);
  }

  async findAll(userId: string): Promise<Note[]> {
    return this.notesRepository.find({
      where: { user: { id: userId } },
      relations: { topic: true, tags: true },
      order: { updatedAt: 'DESC' },
    });
  }

  async findOne(userId: string, noteId: string): Promise<Note> {
    const note = await this.notesRepository.findOne({
      where: { id: noteId, user: { id: userId } },
      relations: { topic: true, tags: true },
    });

    if (!note) {
      throw new NotFoundException(`Note with ID ${noteId} not found`);
    }

    return note;
  }

  async update(userId: string, noteId: string, updateNoteDto: UpdateNoteDto): Promise<Note> {
    const note = await this.findOne(userId, noteId);
    const { title, content, topicId, tagNames } = updateNoteDto;

    if (title !== undefined) {
      note.title = title;
    }

    if (content !== undefined) {
      note.content = content;
    }

    if (topicId !== undefined) {
      if (topicId === null) {
        note.topic = undefined;
      } else {
        const foundTopic = await this.topicsRepository.findOne({ where: { id: topicId } });
        if (!foundTopic) {
          throw new NotFoundException('Topic not found');
        }
        note.topic = foundTopic;
      }
    }

    if (tagNames !== undefined) {
      note.tags = await this.getOrCreateTags(tagNames);
    }

    return this.notesRepository.save(note);
  }

  async remove(userId: string, noteId: string): Promise<void> {
    const note = await this.findOne(userId, noteId);
    await this.notesRepository.remove(note);
  }
}
