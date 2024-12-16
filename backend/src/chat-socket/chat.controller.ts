// src/chat/chat.controller.ts
import { Controller, Get, Post, Body, Param, Query } from '@nestjs/common';
import { ChatService } from './chat.service';
import { CreateMessageDto } from './dto/create-message.dto';
import { Message } from './model/message.model';
import { ChatRoom } from './model/chatroom.model';
import { JoinRoomDto } from './dto/join-room.dto';
import { ApiTags } from '@nestjs/swagger';
import { CreatePrivateMessageDto } from './dto/create-message-1vs1.dto';
import { PagingOffsetDto } from '@libs/core/dto/pagination-offset.dto';

@ApiTags('Socket')
@Controller('chat')
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  @Post('message')
  async createMessage(
    @Body() createMessageDto: CreateMessageDto,
  ): Promise<Message> {
    return this.chatService.createMessage(createMessageDto);
  }

  @Get('messages')
  async getAllMessages(): Promise<Message[]> {
    return this.chatService.getAllMessages();
  }

  @Get('messages/:roomId')
  async getMessagesByRoom(@Param('roomId') roomId: string): Promise<Message[]> {
    return this.chatService.getMessagesByRoom(roomId);
  }

  @Post('room')
  async createRoom(): Promise<ChatRoom> {
    return this.chatService.createRoom();
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

  //chat 1 vs 1
  @Post('private-message')
  async createPrivateMessage(
    @Body() createPrivateMessageDto: CreatePrivateMessageDto,
  ): Promise<Message> {
    return this.chatService.createPrivateMessage(createPrivateMessageDto);
  }

  @Get('private-messages/:senderId/:receiverId')
  async getPrivateMessages(
    @Query() paginationDto: PagingOffsetDto,
    @Param('senderId') senderId: string,
    @Param('receiverId') receiverId: string,
  ) {
    return this.chatService.getPrivateMessages(
      senderId,
      receiverId,
      paginationDto,
    );
  }
}
