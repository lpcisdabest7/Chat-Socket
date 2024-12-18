import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { ChatService } from './chat.service';
import { CreateGroupMessageDto } from './dto/create-message-group.dto';
import { JoinRoomDto } from './dto/join-room.dto';
import { CreatePrivateMessageDto } from './dto/create-message-1vs1.dto';
import { Logger } from '@nestjs/common';

@WebSocketGateway({
  cors: {
    origin: '*', // Adjust this according to your frontend origin
  },
})
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
  private readonly logger = new Logger(ChatGateway.name);

  @WebSocketServer()
  server: Server;

  constructor(private readonly chatService: ChatService) {}

  handleConnection(client: Socket) {
    this.logger.log(`Client connected: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    this.logger.log(`Client disconnected: ${client.id}`);
  }

  @SubscribeMessage('sendGroupMessage')
  async handleCreateMessage(client: Socket, payload: CreateGroupMessageDto) {
    try {
      const message = await this.chatService.chatGroupMessage(payload);

      this.server.to(payload.roomId.toString()).emit('groupMessage', {
        content: message.content,
        userId: payload.userId,
      });
      return message;
    } catch (error) {
      this.logger.error('Error creating message:', error);
    }
  }

  @SubscribeMessage('joinRoom')
  async handleJoinRoom(client: Socket, payload: JoinRoomDto) {
    try {
      const room = await this.chatService.joinRoom(payload);
      client.join(payload.roomId);

      // Notify others in the room
      this.server.to(payload.roomId).emit('userJoined', {
        userId: payload.userId,
        roomId: payload.roomId,
      });

      return room;
    } catch (error) {
      this.logger.error('Error joining room:', error);
    }
  }

  @SubscribeMessage('leaveRoom')
  async handleLeaveRoom(client: Socket, payload: JoinRoomDto) {
    try {
      const room = await this.chatService.leaveRoom(payload);
      client.leave(payload.roomId);

      // Notify others in the room
      this.server.to(payload.roomId).emit('userLeft', {
        userId: payload.userId,
        roomId: payload.roomId,
      });

      return room;
    } catch (error) {
      this.logger.error('Error leaving room:', error);
    }
  }

  @SubscribeMessage('sendPrivateMessage')
  async handleSendPrivateMessage(
    client: Socket,
    payload: CreatePrivateMessageDto,
  ) {
    try {
      const message = await this.chatService.chatPrivateMessage(payload);

      this.server.to(message.roomId.toString()).emit('privateMessage', message);

      return message;
    } catch (error) {
      this.logger.error('Error sending private message:', error);
    }
  }
}
