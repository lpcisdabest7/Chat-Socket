import { StringField } from '@libs/utils/decorators/field.decorator';

export class CreatePrivateMessageDto {
  @StringField()
  senderId: string;

  @StringField()
  receiverId: string;

  @StringField()
  content?: string;

  @StringField()
  roomId: string;
}
