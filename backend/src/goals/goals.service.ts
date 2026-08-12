import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { Goal } from './goal.entity';
import { Topic } from '../topics/topic.entity';
import { User } from '../users/user.entity';
import { CreateGoalDto } from './dto/create-goal.dto';

@Injectable()
export class GoalsService {
  constructor(
    @InjectRepository(Goal)
    private readonly goalsRepository: Repository<Goal>,
    @InjectRepository(Topic)
    private readonly topicsRepository: Repository<Topic>,
  ) {}

  async create(user: User, createGoalDto: CreateGoalDto): Promise<Goal> {
    const { title, targetDate, topicIds } = createGoalDto;

    let topics: Topic[] = [];
    if (topicIds && topicIds.length > 0) {
      topics = await this.topicsRepository.find({
        where: { id: In(topicIds) },
      });
    }

    const goal = this.goalsRepository.create({
      title,
      targetDate: new Date(targetDate),
      user,
      topics,
      completed: false,
    });

    return this.goalsRepository.save(goal);
  }

  async findAll(userId: string): Promise<Goal[]> {
    return this.goalsRepository.find({
      where: { user: { id: userId } },
      relations: { topics: true },
      order: { targetDate: 'ASC' },
    });
  }

  async toggle(userId: string, id: string): Promise<Goal> {
    const goal = await this.goalsRepository.findOne({
      where: { id, user: { id: userId } },
      relations: { topics: true },
    });

    if (!goal) {
      throw new NotFoundException(`Goal with ID ${id} not found`);
    }

    goal.completed = !goal.completed;
    return this.goalsRepository.save(goal);
  }

  async remove(userId: string, id: string): Promise<void> {
    const goal = await this.goalsRepository.findOne({
      where: { id, user: { id: userId } },
    });

    if (!goal) {
      throw new NotFoundException(`Goal with ID ${id} not found`);
    }

    await this.goalsRepository.remove(goal);
  }
}
