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

  private games= new Map<number, Game>();

  @WebSocketServer()
  server: Server;

  async handleConnection(socket: SocketInterface) {
    socket = await this.userService.getUserFromSocket(socket);
    
    if (!socket.user) {
      socket.disconnect(true);
      return;
    }
    const side = socket.user.socialId % 2?'top':'bottom';
    const room:any[] = await this.roomService.getFreeRooms(side);
    if(room.length===0){
      const newRoom =await  this.roomService.cretaeEmptyRoom();
      return this.joinToRoom(socket,newRoom.id,side);
    }
    return this.joinToRoom(socket,room[0].id,side);
  }

  async handleDisconnect(socket: SocketInterface) {
    if (socket.user) {
      return await this.handleLeave(socket);
    }
  }

  async handleJoin(socket: SocketInterface) {

    
    // socket.join(room.id.toString());
    // console.log(`${socket.user.firstName} in room: ${room.id}`);
    // this.server.sockets.to(room.id.toString()).emit('user_joined', room);
    // this.game.set(room.id, new Game(this.quizzService));
    // this.game.get(room.id).tryToStart(room, this.server, socket);
  }
  async joinToRoom(socket,roomId:number,side:string) {
    if(this.games.has(roomId)){
      await this.games.get(roomId).join(socket,side)
    }else{
      const game = new Game(roomId,this.server.sockets.to(roomId.toString()),
      this.quizzService,
      this.roomService,
      this.userService)
      await game.reset();
      await game.join(socket,side)
      this.games.set(roomId,game)
    }
  }

  async handleLeave(socket: SocketInterface) {
    const roomId = socket.user.activeRoomId;
    if(this.games.has(roomId)){
      this.games.get(roomId).leave(socket.user.id)
    }
    // const room = await this.roomService.removeMember(socket.user);
    // if (room) {
    //   this.game.get(room.id).stopGame(room);
    //   socket.leave(room.id.toString());
    //   console.log(`${socket.user.firstName} leave ${room.id}`);
    //   this.server.sockets.to(room.id.toString()).emit('user_leaved', room);
    // }
  }
}
