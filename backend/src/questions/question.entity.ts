import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, ManyToMany, OneToMany, JoinTable } from 'typeorm';
import { User } from '../users/user.entity';
import { Topic } from '../topics/topic.entity';
import { Tag } from '../tags/tag.entity';
import { Answer } from '../answers/answer.entity';

export enum Difficulty {
  EASY = 'EASY',
  MEDIUM = 'MEDIUM',
  HARD = 'HARD',
}

@Entity('questions')
export class Question {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column()
  title!: string;

  @Column({ type: 'text', nullable: true })
  description?: string;

  @Column({
    type: 'enum',
    enum: Difficulty,
    default: Difficulty.MEDIUM,
  })
  difficulty!: Difficulty;

  @ManyToOne(() => User, (user) => user.questions, { onDelete: 'CASCADE' })
  user!: User;

  @ManyToOne(() => Topic, (topic) => topic.questions, { nullable: true, onDelete: 'SET NULL' })
  topic?: Topic;

  @ManyToMany(() => Tag, (tag) => tag.questions)
  @JoinTable({ name: 'question_tags' })
  tags!: Tag[];

  @OneToMany(() => Answer, (answer) => answer.question)
  answers!: Answer[];

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}
