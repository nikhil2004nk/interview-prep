import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Note } from './notes/note.entity';
import { Answer } from './answers/answer.entity';
import { Goal } from './goals/goal.entity';
import { RevisionRecord } from './revision/revision-record.entity';

@Injectable()
export class AppService {
  constructor(
    @InjectRepository(Note)
    private readonly notesRepository: Repository<Note>,
    @InjectRepository(Answer)
    private readonly answersRepository: Repository<Answer>,
    @InjectRepository(Goal)
    private readonly goalsRepository: Repository<Goal>,
    @InjectRepository(RevisionRecord)
    private readonly revisionRecordsRepository: Repository<RevisionRecord>,
  ) {}

  getHello(): string {
    return 'Hello World!';
  }

  async getDashboardMetrics(userId: string) {
    const notesCount = await this.notesRepository.count({
      where: { user: { id: userId } },
    });

    const answers = await this.answersRepository.find({
      where: { question: { user: { id: userId } } },
    });
    const questionsPracticedCount = answers.length;

    let averageScore = 0;
    if (questionsPracticedCount > 0) {
      const scoredAnswers = answers.filter(a => a.score !== undefined && a.score !== null);
      if (scoredAnswers.length > 0) {
        const totalScore = scoredAnswers.reduce((sum, a) => sum + (a.score ?? 0), 0);
        averageScore = Math.round(totalScore / scoredAnswers.length);
      }
    }

    const activeGoalsCount = await this.goalsRepository.count({
      where: { user: { id: userId }, completed: false },
    });

    const completedGoalsCount = await this.goalsRepository.count({
      where: { user: { id: userId }, completed: true },
    });

    const now = new Date();
    const revisionRecords = await this.revisionRecordsRepository.find({
      where: { user: { id: userId } },
    });
    const revisionDueCount = revisionRecords.filter(r => new Date(r.nextRevisionDate) <= now).length;

    return {
      notesCount,
      questionsPracticedCount,
      averageScore,
      activeGoalsCount,
      completedGoalsCount,
      revisionDueCount,
    };
  }
}
