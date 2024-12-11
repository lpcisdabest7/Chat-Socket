import { StringField } from '@libs/utils/decorators/field.decorator';

export class CreateMessageDto {
  @StringField()
  userId: string;

  @StringField()
  content: string;

  @StringField()
  roomId?: string;
}
