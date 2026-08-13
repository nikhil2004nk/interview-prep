import { Injectable, ConflictException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Tag } from './tag.entity';

@Injectable()
export class TagsService {
  constructor(
    @InjectRepository(Tag)
    private readonly tagsRepository: Repository<Tag>,
  ) {}

  async findAll(): Promise<Tag[]> {
    return this.tagsRepository.find({ order: { name: 'ASC' } });
  }

  async findPaginated(page: number, limit: number, search?: string): Promise<{ items: Tag[]; total: number }> {
    const queryBuilder = this.tagsRepository.createQueryBuilder('tag');
    if (search) {
      queryBuilder.where('LOWER(tag.name) LIKE :search', { search: `%${search.toLowerCase().trim()}%` });
    }
    queryBuilder
      .orderBy('tag.name', 'ASC')
      .skip((page - 1) * limit)
      .take(limit);

    const [items, total] = await queryBuilder.getManyAndCount();
    return { items, total };
  }

  async create(name: string): Promise<Tag> {
    const cleanedName = name.trim().toLowerCase();
    const existing = await this.tagsRepository.findOne({ where: { name: cleanedName } });
    if (existing) {
      throw new ConflictException(`Tag with name '${name}' already exists`);
    }
    const tag = this.tagsRepository.create({ name: cleanedName });
    return this.tagsRepository.save(tag);
  }

  async update(id: string, name: string): Promise<Tag> {
    const tag = await this.tagsRepository.findOne({ where: { id } });
    if (!tag) {
      throw new NotFoundException(`Tag with ID ${id} not found`);
    }
    const cleanedName = name.trim().toLowerCase();
    if (tag.name !== cleanedName) {
      const existing = await this.tagsRepository.findOne({ where: { name: cleanedName } });
      if (existing) {
        throw new ConflictException(`Tag with name '${name}' already exists`);
      }
    }
    tag.name = cleanedName;
    return this.tagsRepository.save(tag);
  }

  async remove(id: string): Promise<void> {
    const tag = await this.tagsRepository.findOne({ where: { id } });
    if (!tag) {
      throw new NotFoundException(`Tag with ID ${id} not found`);
    }
    await this.tagsRepository.remove(tag);
  }
}
