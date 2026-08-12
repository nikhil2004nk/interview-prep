import { IsString, IsNotEmpty, IsDateString, IsArray, IsUUID, IsOptional } from 'class-validator';

export class CreateGoalDto {
  @IsString()
  @IsNotEmpty()
  title!: string;

  @IsDateString()
  @IsNotEmpty()
  targetDate!: string;

  @IsArray()
  @IsUUID(undefined, { each: true })
  @IsOptional()
  topicIds?: string[];
}
