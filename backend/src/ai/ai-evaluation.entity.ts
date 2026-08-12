import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne } from 'typeorm';
import { Answer } from '../answers/answer.entity';

@Entity('ai_evaluations')
export class AiEvaluation {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column()
  model!: string;

  @Column({ type: 'text' })
  prompt!: string;

  @Column({ type: 'text' })
  rawResponse!: string;

  @ManyToOne(() => Answer, (answer) => answer.aiEvaluations, { onDelete: 'CASCADE' })
  answer!: Answer;

  @CreateDateColumn()
  createdAt!: Date;
}
