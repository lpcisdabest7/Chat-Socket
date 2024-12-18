import {
  StringField,
  StringFieldOptional,
} from '@libs/utils/decorators/field.decorator';

export class JoinRoomDto {
  @StringField()
  userId: string;

  @StringField()
  roomId: string;
}
