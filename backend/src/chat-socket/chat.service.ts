// src/chat/chat.service.ts
import { HttpStatus, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { CreateMessageDto } from './dto/create-message.dto';
import { Message } from './model/message.model';
import { ChatRoom } from './model/chatroom.model';
import { JoinRoomDto } from './dto/join-room.dto';
import { CreatePrivateMessageDto } from './dto/create-message-1vs1.dto';
import { ApiException } from '@libs/utils/exception';
import { User } from '@app/user/user.schema';

@Injectable()
export class ChatService {
  constructor(
    @InjectModel(Message.name) private messageModel: Model<Message>,
    @InjectModel(ChatRoom.name) private chatRoomModel: Model<ChatRoom>,
    @InjectModel(User.name) private userModel: Model<User>,
  ) {}

  async createMessage(createMessageDto: CreateMessageDto): Promise<Message> {
    const message = new this.messageModel({
      userId: createMessageDto.userId
        ? new Types.ObjectId(createMessageDto.userId)
        : null,
      content: createMessageDto.content,
      roomId: createMessageDto.roomId
        ? new Types.ObjectId(createMessageDto.roomId)
        : null,
    });
    if (createMessageDto.roomId) {
      await this.chatRoomModel.findByIdAndUpdate(createMessageDto.roomId, {
        $push: { messages: message._id },
      });
    }

    return message.save();
  }

  async getAllMessages(): Promise<Message[]> {
    return this.messageModel.find().exec();
  }

  async getMessagesByRoom(roomId: string): Promise<Message[]> {
    return this.messageModel
      .find({ roomId: new Types.ObjectId(roomId) })
      .exec();
  }

  async createRoom(): Promise<ChatRoom> {
    const room = new this.chatRoomModel();
    return room.save();
  }

  async joinRoom(joinRoomDto: JoinRoomDto): Promise<ChatRoom> {
    const user = await this.userModel.findById(joinRoomDto.userId);
    if (!user) {
      throw new ApiException('User not found', HttpStatus.BAD_REQUEST);
    }
    return this.chatRoomModel
      .findByIdAndUpdate(
        joinRoomDto.roomId,
        { $addToSet: { users: new Types.ObjectId(joinRoomDto.userId) } },
        { new: true },
      )
      .exec();
  }

  async leaveRoom(joinRoomDto: JoinRoomDto): Promise<ChatRoom> {
    return this.chatRoomModel
      .findByIdAndUpdate(
        joinRoomDto.roomId,
        { $pull: { users: new Types.ObjectId(joinRoomDto.userId) } },
        { new: true },
      )
      .exec();
  }

  async getAllRooms(): Promise<ChatRoom[]> {
    return this.chatRoomModel.find().exec();
  }

  //chat with 1 vs 1
  async createPrivateMessage(
    createPrivateMessageDto: CreatePrivateMessageDto,
  ): Promise<Message> {
    const sender = await this.userModel.findById(
      createPrivateMessageDto.senderId,
    );
    if (!sender) {
      throw new ApiException('Sender not found', HttpStatus.BAD_REQUEST);
    }
    const receiver = await this.userModel.findById(
      createPrivateMessageDto.receiverId,
    );
    if (!receiver) {
      throw new ApiException('Receiver not found', HttpStatus.BAD_REQUEST);
    }
    const privateMessage = new this.messageModel({
      userId: new Types.ObjectId(createPrivateMessageDto.senderId),
      receiverId: new Types.ObjectId(createPrivateMessageDto.receiverId),
      content: createPrivateMessageDto.content,
      isPrivate: true,
    });

    return privateMessage.save();
  }

  async getPrivateMessages(
    senderId: string,
    receiverId: string,
  ): Promise<Message[]> {
    return this.messageModel
      .find({
        $or: [
          {
            userId: new Types.ObjectId(senderId),
            receiverId: new Types.ObjectId(receiverId),
            isPrivate: true,
          },
          {
            userId: new Types.ObjectId(receiverId),
            receiverId: new Types.ObjectId(senderId),
            isPrivate: true,
          },
        ],
      })
      .sort({ createdAt: 1 })
      .exec();
  }
}
