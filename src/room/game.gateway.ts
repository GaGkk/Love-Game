import {
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  WebSocketGateway,
} from '@nestjs/websockets';
import { Socket } from 'socket.io';
import { verify } from 'jsonwebtoken';
import { JwtPayloadInterface } from 'src/interface/jwtPayload.interface';
import { UnauthorizedException } from '@nestjs/common';
import { RoomService } from './room.service';
import { UserService } from 'src/user/user.service';

@WebSocketGateway({ cors: { origin: '*' } })
export class GameGateway implements OnGatewayConnection, OnGatewayDisconnect {
  constructor(
    private readonly userService: UserService,
    private readonly roomService: RoomService,
  ) {}
  async handleConnection(client: Socket) {
    const token = client.handshake.auth.token;
    if (!token) {
      client.disconnect(true);
      throw new UnauthorizedException('User not Found');
    }
    const { id } = verify(token, process.env.JWT_SECRET) as JwtPayloadInterface;
    const user = await this.userService.getUserbyId(id);
    if (!user) {
      client.disconnect(true);
      throw new UnauthorizedException('User not Found');
    }
    const roomDto = { userId: user.id, gender: user.sex };
    const room = await this.roomService.createRoom(roomDto);
    client.join(room.id.toString());
    console.log(`User ${user.firstName} joined to room ${room.id}`);
  }

  @SubscribeMessage('join')
  handleJoin(client: Socket, roomId: number) {
    console.log(`Client ${client.id} joined room: ${roomId}`);
    client.join(roomId.toString());
    return roomId;
  }

  @SubscribeMessage('leave')
  handleLeave(client: Socket, roomId: number) {
    console.log(`Client ${client.id} leaved room: ${roomId}`);
    client.leave(roomId.toString());
    return roomId;
  }

  @SubscribeMessage('message')
  async handleMessage(client: Socket, message: string, roomId: number) {
    console.log(
      `Client ${client.id} sended message: ${message} to room: ${roomId}`,
    );
    // const message = await this.messageService.createMessage(payload);
    // client.emit('message', message);
    // client.to(message.room.toString()).emit('message', message);
  }

  handleDisconnect(client: Socket) {
    console.log(`Client ${client.id} disconnected`);
  }
}
