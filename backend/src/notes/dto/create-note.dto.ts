import { IsString, IsNotEmpty, IsOptional, IsUUID, IsArray } from 'class-validator';

export class CreateNoteDto {
  @IsString()
  @IsNotEmpty()
  title!: string;

  @IsString()
  @IsNotEmpty()
  content!: string;

  @IsUUID()
  @IsOptional()
  topicId?: string;

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  tagNames?: string[];
}
