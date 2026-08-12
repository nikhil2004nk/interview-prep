import { IsUUID, IsEnum, IsNotEmpty } from 'class-validator';
import { RevisionItemType } from '../revision-record.entity';

export class CreateRevisionDto {
  @IsUUID()
  @IsNotEmpty()
  itemId!: string;

  @IsEnum(RevisionItemType)
  @IsNotEmpty()
  itemType!: RevisionItemType;
}
