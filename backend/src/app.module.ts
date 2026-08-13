import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { User } from './users/user.entity';
import { Note } from './notes/note.entity';
import { Question } from './questions/question.entity';
import { Answer } from './answers/answer.entity';
import { Topic } from './topics/topic.entity';
import { Tag } from './tags/tag.entity';
import { Goal } from './goals/goal.entity';
import { RevisionRecord } from './revision/revision-record.entity';
import { AiEvaluation } from './ai/ai-evaluation.entity';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { NotesModule } from './notes/notes.module';
import { QuestionsModule } from './questions/questions.module';
import { AnswersModule } from './answers/answers.module';
import { TopicsModule } from './topics/topics.module';
import { TagsModule } from './tags/tags.module';
import { GoalsModule } from './goals/goals.module';
import { RevisionModule } from './revision/revision.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRoot({
      type: 'postgres',
      url: process.env.DATABASE_URL,
      entities: [
        User,
        Note,
        Question,
        Answer,
        Topic,
        Tag,
        Goal,
        RevisionRecord,
        AiEvaluation,
      ],
      synchronize: process.env.NODE_ENV !== 'production', // Disable in production
    }),
    UsersModule,
    AuthModule,
    NotesModule,
    QuestionsModule,
    AnswersModule,
    TopicsModule,
    TagsModule,
    GoalsModule,
    RevisionModule,
    TypeOrmModule.forFeature([Note, Answer, Goal, RevisionRecord]),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
