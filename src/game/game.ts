import { Server } from 'socket.io';
import { SocketInterface } from 'src/interface/socket.interface';
import { QuizzService } from 'src/quizz/quizz.service';
import { Room } from 'src/room/room.entity';

export class Game {
  private isStarted: boolean;
  private gameTimer: ReturnType<typeof setTimeout>;
  private answersTimer: ReturnType<typeof setTimeout>;
  private restartTimer: ReturnType<typeof setTimeout>;
  private games = ['favorites'];
  private answers: object[] = [];

  constructor(private readonly quizzService: QuizzService) {}

  async tryToStart(room: Room, server: Server, socket: SocketInterface) {
    if (room.bottomCount >= 1 && room.topCount >= 1 && !this.isStarted) {
      this.isStarted = true;
      this.nextGame(room.id, server, socket);
    }
    if (room.members.length < 2) {
      this.isStarted = false;
    }
  }

  async nextGame(roomId: number, server: Server, socket: SocketInterface) {
    const type = Math.floor(Math.random() * this.games.length);
    if (type === 0) {
      const game = await this.quizzService.getRandomOne();
      server.sockets.to(roomId.toString()).emit('get_game', { type, game });
      this.gameTimer = setTimeout(() => {
        server.sockets
          .to(roomId.toString())
          .emit('receive_answers', this.answers);
        this.answersTimer = setTimeout(() => {
          this.answers = [];
          this.restartTimer = setTimeout(() => {
            this.nextGame(roomId, server, socket);
          }, 2000);
        }, 5000);
      }, 10000);
      socket.on('send_answer', (data) => {
        this.answers.push(data);
      });
    }
  }

  async stopGame(room: Room) {
    if (room.members.length < 2) {
      this.isStarted = false;
      clearTimeout(this.gameTimer);
      clearTimeout(this.answersTimer);
      clearTimeout(this.restartTimer);
    }
  }
}
