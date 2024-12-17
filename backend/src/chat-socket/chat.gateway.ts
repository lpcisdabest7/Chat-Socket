import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { ChatService } from './chat.service';
import { CreateMessageDto } from './dto/create-message.dto';
import { JoinRoomDto } from './dto/join-room.dto';
import { CreatePrivateMessageDto } from './dto/create-message-1vs1.dto';

@WebSocketGateway({
  cors: {
    origin: '*', // Adjust this according to your frontend origin
  },
})
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  constructor(private readonly chatService: ChatService) {}

  handleConnection(client: Socket) {
    console.log(`Client connected: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    console.log(`Client disconnected: ${client.id}`);
  }

  @SubscribeMessage('sendGroupMessage')
  async handleCreateMessage(client: Socket, payload: CreateMessageDto) {
    try {
      const message = await this.chatService.createMessage(payload);
      console.log(
        `Message created: ${message.content}, Room: ${payload.roomId}`,
      );
      this.server.to(payload.roomId).emit('groupMessage', {
        content: message.content,
        userId: payload.userId,
      });
      return message;
    } catch (error) {
      console.error('Error creating message:', error);
    }
  }

  @SubscribeMessage('joinRoom')
  async handleJoinRoom(client: Socket, payload: JoinRoomDto) {
    try {
      const room = await this.chatService.joinRoom(payload);
      console.log(`Client ${client.id} joining room ${payload.roomId}`);
      client.join(payload.roomId);

      // Notify others in the room
      this.server.to(payload.roomId).emit('userJoined', {
        userId: payload.userId,
        roomId: payload.roomId,
      });

      console.log(`User ${payload.userId} joined room ${payload.roomId}`);
      return room;
    } catch (error) {
      console.error('Error joining room:', error);
    }
  }

  @SubscribeMessage('leaveRoom')
  async handleLeaveRoom(client: Socket, payload: JoinRoomDto) {
    try {
      const room = await this.chatService.leaveRoom(payload);
      console.log(`Client ${client.id} leaving room ${payload.roomId}`);
      client.leave(payload.roomId);

      // Notify others in the room
      this.server.to(payload.roomId).emit('userLeft', {
        userId: payload.userId,
        roomId: payload.roomId,
      });

      console.log(`User ${payload.userId} left room ${payload.roomId}`);
      return room;
    } catch (error) {
      console.error('Error leaving room:', error);
    }
  }

  @SubscribeMessage('sendPrivateMessage')
  async handleSendPrivateMessage(
    client: Socket,
    payload: CreatePrivateMessageDto,
  ) {
    try {
      const message = await this.chatService.createPrivateMessage(payload);
      console.log(`Emitting private message to room ${message.roomId}`);
      // Ensure roomId is correct (could be an ObjectId or string)
      console.log(`Room ID for private message: ${message.roomId.toString()}`);
      this.server.to(message.roomId.toString()).emit('privateMessage', message);

      return message;
    } catch (error) {
      console.error('Error sending private message:', error);
    }
  }
}
