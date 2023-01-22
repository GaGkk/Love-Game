import {
  ConnectedSocket,
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  WebSocketGateway,
} from '@nestjs/websockets';
import { Socket } from 'socket.io';
import { RoomService } from './room.service';
import { WsGuard } from 'src/user/ws.guard';
import { UseGuards } from '@nestjs/common';
import { User } from 'src/user/user.entity';
import { currentUser } from 'src/user/user.decorator';

@WebSocketGateway({ cors: { origin: '*' } })
export class GameGateway implements OnGatewayConnection, OnGatewayDisconnect {
  constructor(private readonly roomService: RoomService) {}

  handleConnection(client: Socket) {
    console.log(`Client ${client.id} connected`);
  }

  handleDisconnect(client: Socket) {
    console.log(`Client ${client.id} disconnected`);
  }

  @UseGuards(WsGuard)
  @SubscribeMessage('join')
  async handleJoin(
    @currentUser() user: User,
    @ConnectedSocket() client: Socket,
  ) {
    const room = await this.roomService.createRoom({
      userId: user.id,
      gender: user.sex,
    });
    console.log(`${user.firstName} joined to room: ${room.id}`);
    client.join(room.id.toString());
  }

  @SubscribeMessage('leave')
  handleLeave(client: Socket, roomId: number) {
    console.log(`Client ${client.id} leaved room: ${roomId}`);
    client.leave(roomId.toString());
    return roomId;
  }

  @SubscribeMessage('message')
  async handleMessage(client: Socket, content: string, roomId: number) {
    console.log(
      `Client ${client.id} sended message: ${content} to room: ${roomId}`,
    );
  }
}
