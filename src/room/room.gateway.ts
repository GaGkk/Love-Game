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
  private games = ['favorites'];
  private timerId: any;

  @WebSocketServer()
  async handleConnection(@ConnectedSocket() client: Socket) {
    const user = await this.roomService.getUserFromSocket(client);
    const rooms = await this.roomService.getRooms();
    if (!rooms.length) {
      const room = await this.roomService.createRoomAndJoin(user);
      client.join(room.id.toString());
      console.log(`${user.firstName} in room: ${room.id}`);
      client.emit('user_joined', room);
      this.handleStart(client);
      return;
    }
    const room = await this.roomService.joinToRandom(user);
    // if (room.bottomCount === 1 && room.topCount === 1) {
    //   this.handleStart(client);
    // } else {
    //   clearTimeout(this.timerId);
    // }
    client.join(room?.id.toString());
    console.log(`${user.firstName} in room: ${room.id}`);
    this.server.sockets.emit('user_joined', room);
  }

  async handleDisconnect(@ConnectedSocket() client: Socket) {
    const user = await this.roomService.getUserFromSocket(client);
    const room = await this.roomService.removeMember(client);
    if (room.bottomCount < 1 || room.topCount < 1) {
      clearTimeout(this.timerId);
    }
    client.leave(room?.id.toString());
    this.server.sockets.emit('user_leaved', room);
    console.log(`${user.firstName} disconnected`);
  }

  async handleStart(@ConnectedSocket() client: Socket) {
    const game = Math.floor(Math.random() * this.games.length);
    if (game == 0) {
      const quizz = await this.quizzService.getRandomOne();
      this.server.sockets.emit('get_game', {
        type: game,
        game: quizz,
      });
    }
    this.timerId = setTimeout(() => {
      this.server.sockets.emit('receive_answers', this.answers);
      setTimeout(() => {
        this.answers = [];
        setTimeout(() => {
          this.handleStart(client);
        }, 2000);
      }, 5000);
    }, 10000);
  }

  @SubscribeMessage('send_answer')
  async listenForMessages(@MessageBody() content: string) {
    this.answers.push(content);
  }
}
