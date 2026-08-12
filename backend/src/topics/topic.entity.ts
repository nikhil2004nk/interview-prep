import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToMany, ManyToMany } from 'typeorm';
import { Note } from '../notes/note.entity';
import { Question } from '../questions/question.entity';
import { Goal } from '../goals/goal.entity';

@Entity('topics')
export class Topic {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ unique: true })
  name!: string;

  @Column({ type: 'text', nullable: true })
  description?: string;

  @OneToMany(() => Note, (note) => note.topic)
  notes!: Note[];

  @OneToMany(() => Question, (question) => question.topic)
  questions!: Question[];

  @ManyToMany(() => Goal, (goal) => goal.topics)
  goals!: Goal[];

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}
