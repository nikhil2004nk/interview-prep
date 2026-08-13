import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Answer } from './answer.entity';
import { Question } from '../questions/question.entity';
import { AiEvaluation } from '../ai/ai-evaluation.entity';
import { CreateAnswerDto } from './dto/create-answer.dto';
import { AiService } from '../ai/ai.service';

@Injectable()
export class AnswersService {
  constructor(
    @InjectRepository(Answer)
    private readonly answersRepository: Repository<Answer>,
    @InjectRepository(Question)
    private readonly questionsRepository: Repository<Question>,
    @InjectRepository(AiEvaluation)
    private readonly aiEvaluationsRepository: Repository<AiEvaluation>,
    private readonly aiService: AiService,
  ) {}

  async create(userId: string, createAnswerDto: CreateAnswerDto): Promise<Answer> {
    const { questionId, userAnswer } = createAnswerDto;

    const question = await this.questionsRepository.findOne({
      where: { id: questionId, user: { id: userId } },
    });

    if (!question) {
      throw new NotFoundException(`Question with ID ${questionId} not found`);
    }

    // Call evaluation
    const evaluation = await this.aiService.evaluateAnswer(question, userAnswer);

    const answer = this.answersRepository.create({
      userAnswer,
      score: evaluation.score,
      feedback: evaluation.feedback,
      question,
    });

    const savedAnswer = await this.answersRepository.save(answer);

    // Save detailed AiEvaluation log
    const aiEval = this.aiEvaluationsRepository.create({
      model: 'Antigravity-AI-v1',
      prompt: `Question: ${question.title}\nDescription: ${question.description}\nUser Answer: ${userAnswer}`,
      rawResponse: JSON.stringify(evaluation),
      answer: savedAnswer,
    });
    await this.aiEvaluationsRepository.save(aiEval);

    return savedAnswer;
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
