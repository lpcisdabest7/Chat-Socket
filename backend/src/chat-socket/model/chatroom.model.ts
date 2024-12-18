import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { RoleRoom } from '../chat.enum';

@Schema({ timestamps: true })
export class ChatRoom extends Document {
  @Prop({ type: [{ type: Types.ObjectId, ref: 'User' }] })
  users: Types.ObjectId[];

  @Prop({ type: String })
  groupName: string;

  @Prop({ type: String, enum: RoleRoom })
  role: RoleRoom;
}

export const ChatRoomSchema = SchemaFactory.createForClass(ChatRoom);
