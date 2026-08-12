import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { RevisionRecord, RevisionItemType } from './revision-record.entity';
import { Note } from '../notes/note.entity';
import { Question } from '../questions/question.entity';
import { User } from '../users/user.entity';
import { CreateRevisionDto } from './dto/create-revision.dto';
import { ReviewItemDto } from './dto/review-item.dto';

@Injectable()
export class RevisionService {
  constructor(
    @InjectRepository(RevisionRecord)
    private readonly revisionRecordsRepository: Repository<RevisionRecord>,
    @InjectRepository(Note)
    private readonly notesRepository: Repository<Note>,
    @InjectRepository(Question)
    private readonly questionsRepository: Repository<Question>,
  ) {}

  async create(user: User, createRevisionDto: CreateRevisionDto): Promise<RevisionRecord> {
    const { itemId, itemType } = createRevisionDto;

    // Check if record already exists
    const existing = await this.revisionRecordsRepository.findOne({
      where: { itemId, user: { id: user.id } },
    });
    if (existing) {
      return existing;
    }

    // Verify item exists
    if (itemType === RevisionItemType.NOTE) {
      const note = await this.notesRepository.findOne({ where: { id: itemId } });
      if (!note) throw new NotFoundException('Note not found');
    } else {
      const question = await this.questionsRepository.findOne({ where: { id: itemId } });
      if (!question) throw new NotFoundException('Question not found');
    }

    const record = this.revisionRecordsRepository.create({
      itemId,
      itemType,
      user,
      nextRevisionDate: new Date(),
      intervalDays: 1,
      easeFactor: 2.5,
    });

    return this.revisionRecordsRepository.save(record);
  }

  async findDue(userId: string): Promise<any[]> {
    const records = await this.revisionRecordsRepository.find({
      where: { user: { id: userId } },
      order: { nextRevisionDate: 'ASC' },
    });

    const now = new Date();
    const result = [];

    for (const record of records) {
      const isDue = new Date(record.nextRevisionDate) <= now;
      if (!isDue) continue;

      let item = null;
      if (record.itemType === RevisionItemType.NOTE) {
        item = await this.notesRepository.findOne({
          where: { id: record.itemId },
          relations: { topic: true, tags: true },
        });
      } else {
        item = await this.questionsRepository.findOne({
          where: { id: record.itemId },
          relations: { topic: true, tags: true },
        });
      }

      if (item) {
        result.push({
          ...record,
          item,
        });
      } else {
        // Clean up orphaned revision record if referenced item was deleted
        await this.revisionRecordsRepository.remove(record);
      }
    }

    return result;
  }

  async review(userId: string, id: string, reviewItemDto: ReviewItemDto): Promise<RevisionRecord> {
    const record = await this.revisionRecordsRepository.findOne({
      where: { id, user: { id: userId } },
    });

    if (!record) {
      throw new NotFoundException(`Revision record with ID ${id} not found`);
    }

    const { rating } = reviewItemDto;
    const now = new Date();

    // SM2 Algorithm Implementation
    if (rating < 3) {
      record.intervalDays = 1;
    } else {
      if (record.intervalDays === 1) {
        record.intervalDays = 6;
      } else {
        record.intervalDays = Math.round(record.intervalDays * record.easeFactor);
      }

      // Calculate ease factor adjustment
      record.easeFactor =
        record.easeFactor +
        (0.1 - (5 - rating) * (0.08 + (5 - rating) * 0.02));

      if (record.easeFactor < 1.3) {
        record.easeFactor = 1.3;
      }
    }

    record.lastRevisionDate = now;
    
    // Set next date offset
    const nextDate = new Date();
    nextDate.setDate(nextDate.getDate() + record.intervalDays);
    record.nextRevisionDate = nextDate;

    return this.revisionRecordsRepository.save(record);
  }

  async remove(userId: string, id: string): Promise<void> {
    const record = await this.revisionRecordsRepository.findOne({
      where: { id, user: { id: userId } },
    });

    if (!record) {
      throw new NotFoundException(`Revision record with ID ${id} not found`);
    }

    await this.revisionRecordsRepository.remove(record);
  }
}
