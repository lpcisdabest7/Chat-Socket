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
    origin: '*', // Điều chỉnh origin phù hợp với frontend của bạn
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

      // Phát tin nhắn bao gồm userId và nội dung đến tất cả client trong phòng
      this.server.to(payload.roomId).emit(payload.roomId, {
        content: message.content,
        userId: payload.userId, // Thêm userId vào tin nhắn
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
      client.join(payload.roomId);

      // Thông báo cho các thành viên khác trong phòng
      this.server.to(payload.roomId).emit('userJoined', {
        userId: payload.userId,
        roomId: payload.roomId,
      });

      return room;
    } catch (error) {
      console.error('Error joining room:', error);
    }
  }

  @SubscribeMessage('leaveRoom')
  async handleLeaveRoom(client: Socket, payload: JoinRoomDto) {
    try {
      const room = await this.chatService.leaveRoom(payload);
      client.leave(payload.roomId);

      // Thông báo cho các thành viên khác trong phòng
      this.server.to(payload.roomId).emit('userLeft', {
        userId: payload.userId,
        roomId: payload.roomId,
      });

      return room;
    } catch (error) {
      console.error('Error leaving room:', error);
    }
  }

  // chat 1 vs 1
  @SubscribeMessage('sendPrivateMessage')
  async handleSendPrivateMessage(
    client: Socket,
    payload: CreatePrivateMessageDto,
  ) {
    try {
      const message = await this.chatService.createPrivateMessage(payload);
      // Gửi tin nhắn tới người nhận cụ thể
      this.server
        .to(payload.receiverId)
        .emit(message.roomId.toString(), message);
      this.server.to(payload.senderId).emit(message.roomId.toString(), message);
      return message;
    } catch (error) {
      console.error('Error sending private message:', error);
    }
  }
}
