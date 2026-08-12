import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, ManyToMany, JoinTable } from 'typeorm';
import { User } from '../users/user.entity';
import { Topic } from '../topics/topic.entity';
import { Tag } from '../tags/tag.entity';

@Entity('notes')
export class Note {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column()
  title!: string;

  @Column({ type: 'text' })
  content!: string;

  @ManyToOne(() => User, (user) => user.notes, { onDelete: 'CASCADE' })
  user!: User;

  @ManyToOne(() => Topic, (topic) => topic.notes, { nullable: true, onDelete: 'SET NULL' })
  topic?: Topic;

  @ManyToMany(() => Tag, (tag) => tag.notes)
  @JoinTable({ name: 'note_tags' })
  tags!: Tag[];

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}
