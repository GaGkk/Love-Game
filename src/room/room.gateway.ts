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
    client.join(room?.id.toString());
    console.log(`${user.firstName} in room: ${room.id}`);
    client.emit('user_joined', room);
  }

  async handleDisconnect(@ConnectedSocket() client: Socket) {
    const user = await this.roomService.getUserFromSocket(client);
    const room = await this.roomService.removeMember(client);
    client.leave(room?.id.toString());
    console.log(`${user.firstName} disconnected`);
  }

  async handleStart(@ConnectedSocket() client: Socket) {
    const user = await this.roomService.getUserFromSocket(client);
    const room = await this.roomService.getActiveRoom(user.activeRoomId);
    const game = this.games[Math.floor(Math.random() * this.games.length)];
    if (room.bottomCount > 0 && room.topCount > 0) {
      if (game == 'favorites') {
        const quizz = await this.quizzService.getRandomOne();
        client.emit('get_game', { type: this.games[game], game: quizz });
      }
      setTimeout(() => {
        this.server
          .in(room.id.toString())
          .emit('receive_answers', this.answers);
        this.answers = [];
        setTimeout(() => {
          this.handleStart(client);
        }, 5000);
      }, 10000);
    } else {
      client.emit('waiting', 'No much members!');
    }
  }

  @SubscribeMessage('send_answer')
  async listenForMessages(@MessageBody() content: string) {
    this.answers.push(content);
  }
}
