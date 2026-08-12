import { IsString, IsOptional, IsEnum, IsUUID, IsArray } from 'class-validator';
import { Difficulty } from '../question.entity';

export class UpdateQuestionDto {
  @IsString()
  @IsOptional()
  title?: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsEnum(Difficulty)
  @IsOptional()
  difficulty?: Difficulty;

  @IsUUID()
  @IsOptional()
  topicId?: string;

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  tagNames?: string[];
}
