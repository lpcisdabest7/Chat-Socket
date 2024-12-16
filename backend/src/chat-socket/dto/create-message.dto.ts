import {
  StringField,
  StringFieldOptional,
} from '@libs/utils/decorators/field.decorator';

export class CreateMessageDto {
  @StringField()
  userId: string;

  @StringField()
  content: string;

  @StringFieldOptional()
  roomId?: string;
}
