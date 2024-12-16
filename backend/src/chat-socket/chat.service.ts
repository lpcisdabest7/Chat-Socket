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
import { PagingOffsetDto } from '@libs/core/dto/pagination-offset.dto';
import { PaginationDto } from './dto-message/pagination.dto';

@Injectable()
export class ChatService {
  constructor(
    @InjectModel(Message.name) private messageModel: Model<Message>,
    @InjectModel(ChatRoom.name) private chatRoomModel: Model<ChatRoom>,
    @InjectModel(User.name) private userModel: Model<User>,
  ) {}

  async createMessage(createMessageDto: CreateMessageDto): Promise<Message> {
    const publicMessage = new this.messageModel({
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
        $push: { messages: publicMessage._id },
      });
    }

    return publicMessage.save();
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
  async createPrivateMessage(createPrivateMessageDto: CreatePrivateMessageDto) {
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

    let room: ChatRoom = await this.chatRoomModel.findOne({
      users: {
        $all: [
          new Types.ObjectId(createPrivateMessageDto.senderId),
          new Types.ObjectId(createPrivateMessageDto.receiverId),
        ],
      },
    });
    if (!room) {
      room = await this.createRoom();
    }

    const privateMessage = new this.messageModel({
      userId: new Types.ObjectId(createPrivateMessageDto.senderId),
      receiverId: new Types.ObjectId(createPrivateMessageDto.receiverId),
      roomId: room._id,
      content: createPrivateMessageDto.content,
      isPrivate: true,
    });

    await this.chatRoomModel.findByIdAndUpdate(
      room._id,
      {
        $addToSet: {
          users: {
            $each: [
              new Types.ObjectId(createPrivateMessageDto.senderId),
              new Types.ObjectId(createPrivateMessageDto.receiverId),
            ],
          },
        },
      },
      { new: true },
    );
    return await privateMessage.save();
  }

  async getPrivateMessages1(
    senderId: string,
    receiverId: string,
    paginationDto: PagingOffsetDto,
  ) {
    const { page, limit } = paginationDto;
    const skip = (page - 1) * limit;
    const listMessagesPrivate = await this.messageModel
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
      .populate({ path: 'userId', select: 'username avatarImage' })
      .sort({ updatedAt: -1 })
      .skip(skip)
      .limit(limit)
      .exec();
    const totalRecords = await this.userModel.countDocuments(
      listMessagesPrivate,
    );

    const totalPages = Math.ceil(totalRecords / limit);

    return {
      listMessagePrivate: listMessagesPrivate,
      currentPage: page,
      totalPages,
      hasNextPage: page < totalPages,
      hasPreviousPage: page > 1,
    };
  }

  async getPrivateMessages(
    senderId: string,
    receiverId: string,
    paginationDto: PaginationDto,
  ) {
    const { cursor, limit } = paginationDto;

    const query: Record<string, any> = {
      isPrivate: true,
      $or: [
        {
          userId: new Types.ObjectId(senderId),
          receiverId: new Types.ObjectId(receiverId),
        },
        {
          userId: new Types.ObjectId(receiverId),
          receiverId: new Types.ObjectId(senderId),
        },
      ],
      ...(cursor && { _id: { $lte: new Types.ObjectId(cursor) } }),
    };

    const listMessagesPrivate = await this.messageModel
      .find(query)
      .populate({ path: 'userId', select: 'username avatarImage' })
      .sort({ _id: -1 })
      .limit(limit + 1)
      .exec();

    const hasNextPage = listMessagesPrivate.length > limit;
    const nextCursor = hasNextPage
      ? listMessagesPrivate[listMessagesPrivate.length - 1]._id
      : null;

    if (hasNextPage) {
      listMessagesPrivate.pop();
    }

    return {
      listMessagesPrivate,
      nextCursor,
      hasNextPage,
    };
  }

  async getAllMessagesByRoomId(roomId: string, paginationDto: PaginationDto) {
    const { cursor, limit } = paginationDto;

    const query: Record<string, any> = {
      roomId: new Types.ObjectId(roomId),
      ...(cursor &&
        cursor && {
          _id: { $lte: new Types.ObjectId(cursor) },
        }),
    };

    const listAllMessagesByRoomId = await this.messageModel
      .find(query)
      .populate({ path: 'userId', select: 'username avatarImage' })
      .sort({ _id: -1 })
      .limit(limit + 1)
      .exec();

    const hasNextPage = listAllMessagesByRoomId.length > limit;

    const nextCursor = hasNextPage
      ? listAllMessagesByRoomId[listAllMessagesByRoomId.length - 1]._id
      : null;

    if (hasNextPage) {
      listAllMessagesByRoomId.pop();
    }

    return {
      results: listAllMessagesByRoomId,
      nextCursor,
      hasNext: hasNextPage,
    };
  }
}
