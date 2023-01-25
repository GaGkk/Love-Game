import {
  ConnectedSocket,
  MessageBody,
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { RoomService } from './room.service';
import { WsGuard } from 'src/user/ws.guard';
import { UseGuards } from '@nestjs/common';
import { Socket, Server } from 'socket.io';
import { QuizzService } from 'src/quizz/quizz.service';

@WebSocketGateway({ cors: { origin: '*' } })
export class RoomGateway implements OnGatewayConnection, OnGatewayDisconnect {
  constructor(
    private readonly roomService: RoomService,
    private readonly quizzService: QuizzService,
  ) {}

  @WebSocketServer()
  server: Server;

  private answers = [];

  handleConnection(client: Socket) {
    console.log(`Client ${client.id} connected`);
  }

  async handleDisconnect(client: Socket) {
    const room = await this.roomService.removeMember(client);
    client.leave(room?.id.toString());
    console.log(`Client ${client.id} disconnected from ${room.id} room`);
  }

  @UseGuards(WsGuard)
  @SubscribeMessage('join')
  async handleJoin(@ConnectedSocket() client: Socket) {
    const user = await this.roomService.getUserFromSocket(client);
    const rooms = await this.roomService.getRooms();

    if (!rooms.length) {
      const room = await this.roomService.createRoom(user);
      client.join(room.id.toString());
      console.log(`${user.firstName} in room: ${room.id}`);
      client.emit('user_joined', room);
      this.handleStart(client);
      return;
    }
    //this.handleStart(client);
    const room = await this.roomService.joinToRandom(user);
    client.join(room?.id.toString());
    console.log(`${user.firstName} in room: ${room.id}`);
    client.emit('user_joined', room);
  }

  async handleStart(@ConnectedSocket() client: Socket) {
    const user = await this.roomService.getUserFromSocket(client);
    const room = await this.roomService.getActiveRoom(user.activeRoomId);
    const quizz = await this.quizzService.getRandomOne();
    if (room.bottomCount > 0 && room.topCount > 0) {
      this.server.sockets.emit('receive_answers', this.answers);
      this.answers = [];
      client.emit('get_quizz', { type: 1, game: quizz });
    } else {
      client.emit('waiting', 'No much members!');
    }
    setTimeout(() => {
      this.handleStart(client);
    }, 3000);
  }

  @SubscribeMessage('send_answer')
  async listenForMessages(@MessageBody() content: string) {
    this.answers.push(content);
  }
}
