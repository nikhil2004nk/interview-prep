import { Injectable, ConflictException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Topic } from './topic.entity';
import { CreateTopicDto } from './dto/create-topic.dto';

@Injectable()
export class TopicsService {
  constructor(
    @InjectRepository(Topic)
    private readonly topicsRepository: Repository<Topic>,
  ) {}

  async create(createTopicDto: CreateTopicDto): Promise<Topic> {
    const { name, description } = createTopicDto;
    const cleanedName = name.trim().toLowerCase();

    const existing = await this.topicsRepository.findOne({ where: { name: cleanedName } });
    if (existing) {
      throw new ConflictException(`Topic with name '${name}' already exists`);
    }

    const topic = this.topicsRepository.create({
      name: cleanedName,
      description,
    });

    return this.topicsRepository.save(topic);
  }

  async findAll(): Promise<Topic[]> {
    return this.topicsRepository.find({ order: { name: 'ASC' } });
  }

  async findOne(id: string): Promise<Topic> {
    const topic = await this.topicsRepository.findOne({ where: { id } });
    if (!topic) {
      throw new NotFoundException(`Topic with ID ${id} not found`);
    }
    return topic;
  }
}
