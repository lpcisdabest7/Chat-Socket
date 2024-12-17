import {
  StringField,
  StringFieldOptional,
} from '@libs/utils/decorators/field.decorator';

export class CreatePrivateMessageDto {
  @StringField({ default: '67581350a8ac8e640af96d5d' })
  senderId: string;

  @StringField({ default: '67591224b5e5d530e7a174f6' })
  receiverId: string;

  @StringField()
  content?: string;

  @StringFieldOptional()
  roomId?: string;
}
