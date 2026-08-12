import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne } from 'typeorm';
import { User } from '../users/user.entity';

export enum RevisionItemType {
  NOTE = 'NOTE',
  QUESTION = 'QUESTION',
}

@Entity('revision_records')
export class RevisionRecord {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({
    type: 'enum',
    enum: RevisionItemType,
  })
  itemType!: RevisionItemType;

  @Column('uuid')
  itemId!: string;

  @Column({ type: 'timestamp' })
  nextRevisionDate!: Date;

  @Column({ type: 'timestamp', nullable: true })
  lastRevisionDate?: Date;

  @Column({ type: 'integer', default: 1 })
  intervalDays!: number;

  @Column({ type: 'float', default: 2.5 })
  easeFactor!: number;

  @ManyToOne(() => User, (user) => user.revisionRecords, { onDelete: 'CASCADE' })
  user!: User;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}
