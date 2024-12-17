// src/chat/chat.service.ts
import { HttpStatus, Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Message } from './model/message.model';
import { ChatRoom } from './model/chatroom.model';
import { JoinRoomDto } from './dto/join-room.dto';
import { CreatePrivateMessageDto } from './dto/create-message-1vs1.dto';
import { ApiException } from '@libs/utils/exception';
import { User } from '@app/user/user.schema';
import { PagingOffsetDto } from '@libs/core/dto/pagination-offset.dto';
import { PaginationDto } from './dto-message/pagination.dto';
import { CreateGroupMessageDto } from './dto/create-message-group.dto';

@Injectable()
export class ChatService {
  private readonly logger = new Logger(ChatService.name);

  constructor(
    @InjectModel(Message.name) private messageModel: Model<Message>,
    @InjectModel(ChatRoom.name) private chatRoomModel: Model<ChatRoom>,
    @InjectModel(User.name) private userModel: Model<User>,
  ) {}

  async createGroupMessage(
    createGroupMessageDto: CreateGroupMessageDto,
  ): Promise<Message> {
    const groupMessage = new this.messageModel({
      userId: createGroupMessageDto.userId
        ? new Types.ObjectId(createGroupMessageDto.userId)
        : null,
      content: createGroupMessageDto.content,
      roomId: createGroupMessageDto.roomId
        ? new Types.ObjectId(createGroupMessageDto.roomId)
        : null,
    });
    if (createGroupMessageDto.roomId) {
      await this.chatRoomModel.findByIdAndUpdate(createGroupMessageDto.roomId, {
        $push: { messages: groupMessage._id },
      });
    }

    return groupMessage.save();
  }

  async getAllMessages(): Promise<Message[]> {
    return this.messageModel.find().exec();
  }

  async getMessagesByRoom(roomId: string): Promise<Message[]> {
    return this.messageModel
      .find({ roomId: new Types.ObjectId(roomId) })
      .exec();
  }

  async createRoom(groupName: string): Promise<ChatRoom> {
    const room = new this.chatRoomModel();
    room.groupName = groupName;
    return await room.save();
  }

  async joinRoom(joinRoomDto: JoinRoomDto): Promise<ChatRoom> {
    // Step 1: Find the user by userId
    const user = await this.userModel.findById(joinRoomDto.userId);

    if (!user) {
      // If user not found, throw an ApiException with a BAD_REQUEST error
      throw new ApiException('User not found', HttpStatus.BAD_REQUEST);
    }

    // Step 2: Check if the room exists
    const room = await this.chatRoomModel.findById(joinRoomDto.roomId);
    if (!room) {
      // If room not found, throw an ApiException with a NOT_FOUND error
      throw new ApiException('Chat room not found', HttpStatus.NOT_FOUND);
    }

    // Step 3: Add the user to the room (avoid duplicates)
    const updatedRoom = await this.chatRoomModel
      .findByIdAndUpdate(
        joinRoomDto.roomId,
        { $addToSet: { users: new Types.ObjectId(joinRoomDto.userId) } },
        { new: true }, // Return the updated room after the operation
      )
      .exec();

    if (!updatedRoom) {
      // If there is an issue with updating the room, throw an exception
      throw new ApiException(
        'Failed to add user to room',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }

    // Return the updated room
    return updatedRoom;
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

  async getAllGroupRooms(): Promise<ChatRoom[]> {
    return this.chatRoomModel.find({ groupName: { $exists: true } }).exec();
  }

  async findRoomIdByUser(senderId: string, receiverId: string) {
    let room = await this.chatRoomModel.findOne({
      users: {
        $all: [new Types.ObjectId(senderId), new Types.ObjectId(receiverId)],
      },
    });
    if (!room) {
      room = await this.chatRoomModel.create({
        users: [new Types.ObjectId(senderId), new Types.ObjectId(receiverId)],
      });
    }
    return room;
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

    const room = await this.chatRoomModel.findOne({
      _id: new Types.ObjectId(createPrivateMessageDto.roomId),
      users: {
        $all: [
          new Types.ObjectId(createPrivateMessageDto.senderId),
          new Types.ObjectId(createPrivateMessageDto.receiverId),
        ],
      },
    });

    if (!room) {
      throw new ApiException('Bad Request', HttpStatus.BAD_REQUEST);
    }

    const privateMessage = new this.messageModel({
      userId: new Types.ObjectId(createPrivateMessageDto.senderId),
      receiverId: new Types.ObjectId(createPrivateMessageDto.receiverId),
      roomId: new Types.ObjectId(createPrivateMessageDto.roomId),
      content: createPrivateMessageDto.content,
      isPrivate: true,
    });

    return await privateMessage.save();
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
