import { IsString, IsOptional, IsUUID, IsArray } from 'class-validator';

export class UpdateNoteDto {
  @IsString()
  @IsOptional()
  title?: string;

  @IsString()
  @IsOptional()
  content?: string;

  @IsUUID()
  @IsOptional()
  topicId?: string;

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  tagNames?: string[];
}
