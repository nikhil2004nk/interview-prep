import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, ManyToMany, JoinTable } from 'typeorm';
import { User } from '../users/user.entity';
import { Topic } from '../topics/topic.entity';

@Entity('goals')
export class Goal {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column()
  title!: string;

  @Column({ type: 'timestamp' })
  targetDate!: Date;

  @Column({ default: false })
  completed!: boolean;

  @ManyToOne(() => User, (user) => user.goals, { onDelete: 'CASCADE' })
  user!: User;

  @ManyToMany(() => Topic, (topic) => topic.goals)
  @JoinTable({ name: 'goal_topics' })
  topics!: Topic[];

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}
