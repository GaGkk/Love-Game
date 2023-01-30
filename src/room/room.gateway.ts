import {
  MessageBody,
  OnGatewayDisconnect,
  OnGatewayInit,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { RoomService } from './room.service';
import { Server } from 'socket.io';
import { UseGuards } from '@nestjs/common';
import { WsGuard } from 'src/user/ws.guard';
import { SocketInterface } from 'src/interface/socket.interface';
import { UserService } from 'src/user/user.service';
import { verify } from 'jsonwebtoken';
import { OnGatewayConnection } from '@nestjs/websockets/interfaces/hooks';

@WebSocketGateway({ cors: { origin: '*' } })
export class RoomGateway
  implements OnGatewayDisconnect, OnGatewayConnection, OnGatewayInit
{
  constructor(
    private readonly roomService: RoomService,
    private readonly userService: UserService,
  ) {}

  private answers = [];
  private gameTimer: ReturnType<typeof setTimeout>;
  private answersTimer: ReturnType<typeof setTimeout>;
  private restartTimer: ReturnType<typeof setTimeout>;
  private isStarted: boolean;

  @WebSocketServer()
  server: Server;

  afterInit(server: Server) {
    server.use(async (socket: SocketInterface, next) => {
      const bearerToken = socket.handshake.headers.authorization;
      if (!bearerToken) {
        socket.user = null;
        next();
        return;
      }
      const token = bearerToken.split(' ')[1];
      try {
        const decode = verify(token, process.env.JWT_SECRET);
        const user = await this.userService.getUserbySocialId(+decode);
        socket.user = user;
        next();
      } catch {
        socket.user = null;
        next();
      }
    });
  }

  handleConnection(socket: SocketInterface) {
    if (!socket.user) {
      socket.disconnect(true);
    }
    console.log(`${socket.user.firstName} connected`);
    return this.handleJoin(socket);
  }

  handleDisconnect(socket: SocketInterface) {
    console.log(`${socket.user.firstName} disconnected`);
    return this.handleLeave(socket);
  }

  async handleJoin(socket: SocketInterface) {
    const room = await this.roomService.joinToRandom(socket.user);
    socket.join(room.id.toString());
    console.log(`${socket.user.firstName} in room: ${room.id}`);
    this.server.sockets.to(room.id.toString()).emit('user_joined', room);
    if (room.bottomCount >= 1 && room.topCount >= 1 && !this.isStarted) {
      this.handleStart(socket);
      this.isStarted = true;
    }
  }

  @UseGuards(WsGuard)
  @SubscribeMessage('leave_room')
  async handleLeave(socket: SocketInterface) {
    const room = await this.roomService.removeMember(socket.user);
    if (room) {
      if (room.members.length < 2) {
        this.isStarted = false;
        clearTimeout(this.gameTimer);
        clearTimeout(this.answersTimer);
        clearTimeout(this.restartTimer);
      }
      socket.leave(room.id.toString());
      console.log(`${socket.user.firstName} leave ${room.id}`);
      this.server.sockets.to(room.id.toString()).emit('user_leaved', room);
    }
  }

  @UseGuards(WsGuard)
  @SubscribeMessage('start_game')
  async handleStart(socket: SocketInterface) {
    const game = await this.roomService.getRandomGame();

    this.server.sockets
      .to(socket.user.activeRoomId?.toString())
      .emit('get_game', game);
    this.gameTimer = setTimeout(() => {
      this.server.sockets
        .to(socket.user.activeRoomId.toString())
        .emit('receive_answers', this.answers);
      this.answersTimer = setTimeout(() => {
        this.answers = [];
        this.restartTimer = setTimeout(() => {
          this.handleStart(socket);
        }, 2000);
      }, 5000);
    }, 10000);
  }

  @SubscribeMessage('send_answer')
  async listenForMessages(@MessageBody() content: string) {
    this.answers.push(content);
  }
}
