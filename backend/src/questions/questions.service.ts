import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Question } from './question.entity';
import { Tag } from '../tags/tag.entity';
import { Topic } from '../topics/topic.entity';
import { User } from '../users/user.entity';
import { CreateQuestionDto } from './dto/create-question.dto';
import { UpdateQuestionDto } from './dto/update-question.dto';

@Injectable()
export class QuestionsService {
  constructor(
    @InjectRepository(Question)
    private readonly questionsRepository: Repository<Question>,
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

  async create(user: User, createQuestionDto: CreateQuestionDto): Promise<Question> {
    const { title, description, difficulty, topicId, tagNames } = createQuestionDto;

    let topic = undefined;
    if (topicId) {
      const foundTopic = await this.topicsRepository.findOne({ where: { id: topicId } });
      if (!foundTopic) {
        throw new NotFoundException('Topic not found');
      }
      topic = foundTopic;
    }

    const tags = await this.getOrCreateTags(tagNames);

    const question = this.questionsRepository.create({
      title,
      description,
      difficulty,
      user,
      topic,
      tags,
    });

    return this.questionsRepository.save(question);
  }

  async findAll(userId: string): Promise<Question[]> {
    return this.questionsRepository.find({
      where: { user: { id: userId } },
      relations: { topic: true, tags: true },
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(userId: string, id: string): Promise<Question> {
    const question = await this.questionsRepository.findOne({
      where: { id, user: { id: userId } },
      relations: { topic: true, tags: true },
    });

    if (!question) {
      throw new NotFoundException(`Question with ID ${id} not found`);
    }

    return question;
  }

  async update(userId: string, id: string, updateQuestionDto: UpdateQuestionDto): Promise<Question> {
    const question = await this.findOne(userId, id);
    const { title, description, difficulty, topicId, tagNames } = updateQuestionDto;

    if (title !== undefined) question.title = title;
    if (description !== undefined) question.description = description;
    if (difficulty !== undefined) question.difficulty = difficulty;

    if (topicId !== undefined) {
      if (topicId === null) {
        question.topic = undefined;
      } else {
        const foundTopic = await this.topicsRepository.findOne({ where: { id: topicId } });
        if (!foundTopic) {
          throw new NotFoundException('Topic not found');
        }
        question.topic = foundTopic;
      }
    }

    if (tagNames !== undefined) {
      question.tags = await this.getOrCreateTags(tagNames);
    }

    return this.questionsRepository.save(question);
  }

  async remove(userId: string, id: string): Promise<void> {
    const question = await this.findOne(userId, id);
    await this.questionsRepository.remove(question);
  }
}
