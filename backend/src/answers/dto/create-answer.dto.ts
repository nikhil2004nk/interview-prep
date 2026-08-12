import { IsUUID, IsString, IsNotEmpty } from 'class-validator';

export class CreateAnswerDto {
  @IsUUID()
  @IsNotEmpty()
  questionId!: string;

  @IsString()
  @IsNotEmpty()
  userAnswer!: string;
}
