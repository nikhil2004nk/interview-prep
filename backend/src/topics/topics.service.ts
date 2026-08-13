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

  async findPaginated(page: number, limit: number, search?: string): Promise<{ items: Topic[]; total: number }> {
    const queryBuilder = this.topicsRepository.createQueryBuilder('topic');
    if (search) {
      queryBuilder.where('LOWER(topic.name) LIKE :search', { search: `%${search.toLowerCase().trim()}%` });
    }
    queryBuilder
      .orderBy('topic.name', 'ASC')
      .skip((page - 1) * limit)
      .take(limit);

    const [items, total] = await queryBuilder.getManyAndCount();
    return { items, total };
  }

  async findOne(id: string): Promise<Topic> {
    const topic = await this.topicsRepository.findOne({ where: { id } });
    if (!topic) {
      throw new NotFoundException(`Topic with ID ${id} not found`);
    }
    return topic;
  }

  async update(id: string, updateTopicDto: Partial<CreateTopicDto>): Promise<Topic> {
    const topic = await this.findOne(id);
    const { name, description } = updateTopicDto;

    if (name) {
      const cleanedName = name.trim().toLowerCase();
      if (topic.name !== cleanedName) {
        const existing = await this.topicsRepository.findOne({ where: { name: cleanedName } });
        if (existing) {
          throw new ConflictException(`Topic with name '${name}' already exists`);
        }
      }
      topic.name = cleanedName;
    }

    if (description !== undefined) {
      topic.description = description;
    }

    return this.topicsRepository.save(topic);
  }

  async remove(id: string): Promise<void> {
    const topic = await this.findOne(id);
    await this.topicsRepository.remove(topic);
  }
}
