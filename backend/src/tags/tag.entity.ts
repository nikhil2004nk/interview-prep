import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToMany } from 'typeorm';
import { Note } from '../notes/note.entity';
import { Question } from '../questions/question.entity';

@Entity('tags')
export class Tag {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ unique: true })
  name!: string;

  @ManyToMany(() => Note, (note) => note.tags)
  notes!: Note[];

  @ManyToMany(() => Question, (question) => question.tags)
  questions!: Question[];

  @CreateDateColumn()
  createdAt!: Date;
}
