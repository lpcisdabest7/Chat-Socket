import {
  StringField,
  StringFieldOptional,
} from '@libs/utils/decorators/field.decorator';

export class CreateGroupMessageDto {
  @StringField()
  userId: string;

  @StringField()
  content: string;

  @StringFieldOptional()
  roomId?: string;
}
