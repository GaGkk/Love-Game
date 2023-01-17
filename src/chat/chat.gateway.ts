import {
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  WebSocketGateway,
} from '@nestjs/websockets';
import { Socket } from 'socket.io';
import { CreateMessageDto } from 'src/message/dto/create-message.dto';
import { MessageService } from 'src/message/message.service';

@WebSocketGateway({ cors: { origin: '*' } })
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
  constructor(private readonly messageService: MessageService) {}
  handleConnection(client: Socket) {
    const token = client.handshake.auth; // const payload = this.authService.verifyToken(token);
    // if (!payload) {
    //   client.disconnect(true);
    // } else {
    //   console.log(`Client ${client.id} connected. Auth token: ${token}`);
    // }
    console.log(client.id);
  }

  @SubscribeMessage('join')
  handleJoin(client: Socket, roomId: number) {
    console.log(`Client ${client.id} joined room: ${roomId}`);
    client.join(roomId.toString());
    console.log(client.rooms.size);
    return roomId;
  }

  @SubscribeMessage('leave')
  handleLeave(client: Socket, roomId: number) {
    console.log(`Client ${client.id} leaved room: ${roomId}`);
    client.leave(roomId.toString());
    return roomId;
  }

  @SubscribeMessage('message')
  async handleMessage(client: Socket, createMessageDto: CreateMessageDto) {
    console.log(
      `Client ${client.id} sended message: ${createMessageDto.content} to room: ${createMessageDto.roomId}`,
    );
    const message = await this.messageService.createMessage(createMessageDto);
    client.emit('message', message);
    client.to(message.room.toString()).emit('message', message);
  }

  handleDisconnect(client: Socket) {
    console.log(`Client ${client.id} disconnected`);
  }
}
