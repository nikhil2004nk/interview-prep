import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, OneToMany } from 'typeorm';
import { Question } from '../questions/question.entity';
import { AiEvaluation } from '../ai/ai-evaluation.entity';

@Entity('answers')
export class Answer {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'text' })
  userAnswer!: string;

  @Column({ type: 'text', nullable: true })
  feedback?: string;

  @Column({ type: 'integer', nullable: true })
  score?: number;

  @ManyToOne(() => Question, (question) => question.answers, { onDelete: 'CASCADE' })
  question!: Question;

  @OneToMany(() => AiEvaluation, (evaluation) => evaluation.answer)
  aiEvaluations!: AiEvaluation[];

  @CreateDateColumn()
  createdAt!: Date;
}
