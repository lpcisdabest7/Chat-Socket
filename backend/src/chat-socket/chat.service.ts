// src/chat/chat.service.ts
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { CreateMessageDto } from './dto/create-message.dto';
import { Message } from './model/message.model';
import { ChatRoom } from './model/chatroom.model';
import { JoinRoomDto } from './dto/join-room.dto';
import { CreatePrivateMessageDto } from './dto/create-message-1vs1.dto';

@Injectable()
export class ChatService {
  constructor(
    @InjectModel(Message.name) private messageModel: Model<Message>,
    @InjectModel(ChatRoom.name) private chatRoomModel: Model<ChatRoom>,
  ) {}

  async createMessage(createMessageDto: CreateMessageDto): Promise<Message> {
    const message = new this.messageModel({
      userId: createMessageDto.userId,
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
    return this.chatRoomModel
      .findByIdAndUpdate(
        joinRoomDto.roomId,
        { $addToSet: { users: joinRoomDto.userId } },
        { new: true },
      )
      .exec();
  }

  async leaveRoom(joinRoomDto: JoinRoomDto): Promise<ChatRoom> {
    return this.chatRoomModel
      .findByIdAndUpdate(
        joinRoomDto.roomId,
        { $pull: { users: joinRoomDto.userId } },
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
    const privateMessage = new this.messageModel({
      userId: new Types.ObjectId(createPrivateMessageDto.senderId),
      receiverId: new Types.ObjectId(createPrivateMessageDto.receiverId),
      content: createPrivateMessageDto.content,
      isPrivate: true,
    });

    return privateMessage.save();
  }

  async getPrivateMessages(
    user1Id: string,
    user2Id: string,
  ): Promise<Message[]> {
    return this.messageModel
      .find({
        $or: [
          {
            userId: new Types.ObjectId(user1Id),
            receiverId: new Types.ObjectId(user2Id),
            isPrivate: true,
          },
          {
            userId: new Types.ObjectId(user2Id),
            receiverId: new Types.ObjectId(user1Id),
            isPrivate: true,
          },
        ],
      })
      .sort({ createdAt: 1 })
      .exec();
  }
}
