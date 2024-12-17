// src/chat/chat.controller.ts
import { Controller, Get, Post, Body, Param, Query } from '@nestjs/common';
import { ChatService } from './chat.service';
import { CreateGroupMessageDto } from './dto/create-message-group.dto';
import { Message } from './model/message.model';
import { ChatRoom } from './model/chatroom.model';
import { JoinRoomDto } from './dto/join-room.dto';
import { ApiTags } from '@nestjs/swagger';
import { CreatePrivateMessageDto } from './dto/create-message-1vs1.dto';
import { PaginationDto } from './dto-message/pagination.dto';

@ApiTags('Socket')
@Controller('chat')
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  @Get('messages/:roomId')
  async getAllMessagesByRoomId(
    @Param('roomId') roomId: string,
    @Query() paginationDto: PaginationDto,
  ) {
    return this.chatService.getAllMessagesByRoomId(roomId, paginationDto);
  }

  @Post('messages/:senderId/:receiverId')
  async findRoomIdByUser(
    @Param('senderId') senderId: string,
    @Param('receiverId') receiverId: string,
  ) {
    return this.chatService.findRoomIdByUser(senderId, receiverId);
  }

  @Post('message/:groupName')
  async createRoom(@Param('groupName') groupName: string): Promise<ChatRoom> {
    return this.chatService.createRoom(groupName);
  }

  @Post('room/join')
  async joinRoom(@Body() joinRoomDto: JoinRoomDto): Promise<ChatRoom> {
    return this.chatService.joinRoom(joinRoomDto);
  }

  @Post('room/leave')
  async leaveRoom(@Body() joinRoomDto: JoinRoomDto): Promise<ChatRoom> {
    return this.chatService.leaveRoom(joinRoomDto);
  }

  @Get('rooms')
  async getAllRooms(): Promise<ChatRoom[]> {
    return this.chatService.getAllRooms();
  }

  @Get('message/group')
  async getAllGroupRooms(): Promise<ChatRoom[]> {
    return this.chatService.getAllGroupRooms();
  }
  // chat group
  @Post('group-message')
  async createMessage(
    @Body() createGroupMessageDto: CreateGroupMessageDto,
  ): Promise<Message> {
    return this.chatService.createGroupMessage(createGroupMessageDto);
  }

  //chat 1 vs 1
  @Post('private-message')
  async createPrivateMessage(
    @Body() createPrivateMessageDto: CreatePrivateMessageDto,
  ): Promise<Message> {
    return this.chatService.createPrivateMessage(createPrivateMessageDto);
  }
}
