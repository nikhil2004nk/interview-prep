import { IsInt, Min, Max, IsNotEmpty } from 'class-validator';

export class ReviewItemDto {
  @IsInt()
  @Min(0)
  @Max(5)
  @IsNotEmpty()
  rating!: number;
}
