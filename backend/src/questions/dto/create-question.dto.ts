import { IsString, IsNotEmpty, IsOptional, IsEnum, IsUUID, IsArray } from 'class-validator';
import { Difficulty } from '../question.entity';

export class CreateQuestionDto {
  @IsString()
  @IsNotEmpty()
  title!: string;

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
