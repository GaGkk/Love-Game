import {
  OnGatewayDisconnect,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { RoomService } from './room.service';
import { Server } from 'socket.io';
import { SocketInterface } from 'src/interface/socket.interface';
import { UserService } from 'src/user/user.service';
import { OnGatewayConnection } from '@nestjs/websockets/interfaces/hooks';
import { Game } from 'src/game/game';
import { QuizzService } from 'src/quizz/quizz.service';

@WebSocketGateway({ cors: { origin: '*' } })
export class RoomGateway implements OnGatewayDisconnect, OnGatewayConnection {
  constructor(
    public readonly roomService: RoomService,
    private readonly userService: UserService,
    private readonly quizzService: QuizzService,
  ) {}

  private game = new Map<number, Game>();

  @WebSocketServer()
  server: Server;

  async handleConnection(socket: SocketInterface) {
    socket = await this.userService.getUserFromSocket(socket);
    if (!socket.user) {
      socket.disconnect(true);
      return;
    }
    console.log(`${socket.user.firstName} connected`);
    return this.handleJoin(socket);
  }

  async handleDisconnect(socket: SocketInterface) {
    if (socket.user) {
      console.log(`${socket.user.firstName} disconnected`);
      return await this.handleLeave(socket);
    }
  }

  async handleJoin(socket: SocketInterface) {
    const room = await this.roomService.joinToRandom(socket.user);
    socket.join(room.id.toString());
    console.log(`${socket.user.firstName} in room: ${room.id}`);
    this.server.sockets.to(room.id.toString()).emit('user_joined', room);
    this.game.set(room.id, new Game(this.quizzService));
    this.game.get(room.id).tryToStart(room, this.server);
  }

  async handleLeave(socket: SocketInterface) {
    const room = await this.roomService.removeMember(socket.user);
    if (room) {
      this.game.get(room.id).stopGame(room);
      socket.leave(room.id.toString());
      console.log(`${socket.user.firstName} leave ${room.id}`);
      this.server.sockets.to(room.id.toString()).emit('user_leaved', room);
    }
  }
}
