import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToMany } from 'typeorm';
import { Note } from '../notes/note.entity';
import { Question } from '../questions/question.entity';
import { Goal } from '../goals/goal.entity';
import { RevisionRecord } from '../revision/revision-record.entity';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ unique: true })
  email!: string;

  @Column()
  password!: string;

  @Column({ nullable: true })
  name?: string;

  @OneToMany(() => Note, (note) => note.user)
  notes!: Note[];

  @OneToMany(() => Question, (question) => question.user)
  questions!: Question[];

  @OneToMany(() => Goal, (goal) => goal.user)
  goals!: Goal[];

  @OneToMany(() => RevisionRecord, (record) => record.user)
  revisionRecords!: RevisionRecord[];

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}
