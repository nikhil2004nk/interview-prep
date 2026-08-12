import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Answer } from './answer.entity';
import { Question } from '../questions/question.entity';
import { CreateAnswerDto } from './dto/create-answer.dto';

@Injectable()
export class AnswersService {
  constructor(
    @InjectRepository(Answer)
    private readonly answersRepository: Repository<Answer>,
    @InjectRepository(Question)
    private readonly questionsRepository: Repository<Question>,
  ) {}

  async create(userId: string, createAnswerDto: CreateAnswerDto): Promise<Answer> {
    const { questionId, userAnswer } = createAnswerDto;

    const question = await this.questionsRepository.findOne({
      where: { id: questionId, user: { id: userId } },
    });

    if (!question) {
      throw new NotFoundException(`Question with ID ${questionId} not found`);
    }

    const answer = this.answersRepository.create({
      userAnswer,
      question,
    });

    return this.answersRepository.save(answer);
  }

  async findAllForQuestion(userId: string, questionId: string): Promise<Answer[]> {
    return this.answersRepository.find({
      where: { question: { id: questionId, user: { id: userId } } },
      order: { createdAt: 'DESC' },
    });
  }

  async findAll(userId: string): Promise<Answer[]> {
    return this.answersRepository.find({
      where: { question: { user: { id: userId } } },
      relations: { question: true },
      order: { createdAt: 'DESC' },
    });
  }
}
