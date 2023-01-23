import {
  ConnectedSocket,
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  WebSocketGateway,
} from '@nestjs/websockets';
import { RoomService } from './room.service';
import { WsGuard } from 'src/user/ws.guard';
import { UseGuards } from '@nestjs/common';
import { currentUser } from 'src/user/user.decorator';
import { User } from 'src/user/user.entity';
import { Socket } from 'socket.io';

@WebSocketGateway({ cors: { origin: '*' } })
export class RoomGateway implements OnGatewayConnection, OnGatewayDisconnect {
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
    const rooms = await this.roomService.getRooms();
    if (!rooms.length) {
      const room = await this.roomService.createRoom(user);
      console.log(`${user.firstName} joined to room: ${room.id}`);
      client.join(room.id.toString());
      return { event: 'user_joined', data: room };
    }
    const room = await this.roomService.joinToRandom(user);
    client.join(room.id.toString());
    console.log(`${user.firstName} joined to room: ${room.id}`);
    return { event: 'user_joined', data: room };
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
