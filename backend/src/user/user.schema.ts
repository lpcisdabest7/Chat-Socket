import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { RoleType } from '@libs/modules/token/token.type';
import { Types, Document } from 'mongoose';
import { v4 as uuidv4 } from 'uuid';

@Schema({
  timestamps: true,
})
export class User extends Document<Types.ObjectId> {
  @Prop()
  email: string;

  @Prop()
  password: string;

  @Prop({ type: String })
  username: string;

  @Prop({ type: String, required: false })
  avatarImage?: string;

  @Prop({ type: [{ provider: String, providerId: String }], default: [] })
  providers: { provider: string; providerId: string }[];

  @Prop({ default: RoleType.USER, enum: RoleType })
  role: RoleType;

  @Prop({ type: String, default: uuidv4() })
  sessionDevice: string;

  @Prop({ type: Boolean, default: false })
  isSet: boolean;

  @Prop({ type: [{ type: Types.ObjectId, ref: 'User' }] })
  friends: Types.ObjectId[];
}

export const UserSchema = SchemaFactory.createForClass(User);
UserSchema.index({ email: 1 }, { unique: true, sparse: true });
UserSchema.set('toJSON', {
  transform: function (doc, ret) {
    delete ret['password'];
    return ret;
  },
});
