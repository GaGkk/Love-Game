import {
  ConnectedSocket,
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { RoomService } from './room.service';
import { WsGuard } from 'src/user/ws.guard';
import { UseGuards } from '@nestjs/common';
import { currentUser } from 'src/user/user.decorator';
import { User } from 'src/user/user.entity';
import { Socket, Server } from 'socket.io';

@WebSocketGateway({ cors: { origin: '*' } })
export class RoomGateway implements OnGatewayConnection, OnGatewayDisconnect {
  constructor(private readonly roomService: RoomService) {}
  @WebSocketServer()
  server: Server;

  handleConnection(client: Socket) {
    console.log(`Client ${client.id} connected`);
  }

  async handleDisconnect(client: Socket) {
    const room = await this.roomService.removeMember(client);
    client.leave(room.id.toString());
    console.log(`Client ${client.id} disconnected from ${room.id} room`);
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
    client.emit('user_joined', room);
  }

  // @SubscribeMessage('send_message')
  // async listenForMessages(
  //   @currentUser() user: User,
  //   @MessageBody() content: string,
  //   @ConnectedSocket() client: Socket,
  // ) {
  //   const message = await this.chatService.saveMessage(content, user);
  //   this.server.sockets.emit('receive_message', message);
  // }

  // @SubscribeMessage('request_all_messages')
  // async requestAllMessages(@ConnectedSocket() client: Socket) {
  //   const messages = await this.chatService.getAllMessages();
  //   client.emit('send_all_messages', messages);
  // }
}
