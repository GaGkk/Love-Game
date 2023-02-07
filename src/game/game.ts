import { Server, BroadcastOperator } from 'socket.io';
import { DefaultEventsMap } from 'socket.io/dist/typed-events'
import { SocketInterface } from 'src/interface/socket.interface';
import { QuizzService } from 'src/quizz/quizz.service';
import { MemberStatus, Room } from 'src/room/room.entity';
import { RoomService } from 'src/room/room.service';
import { UserService } from 'src/user/user.service';
import { DURATIONS } from "./game.confg"
export class Game {
  private isStarted: boolean;
  private gameTimer: ReturnType<typeof setTimeout>;
  private answersTimer: ReturnType<typeof setTimeout>;
  private restartTimer: ReturnType<typeof setTimeout>;
  private games = ['question'];
  private answersOfQuestion: object[] = [];
  private _tops: any[] = []
  private _bottoms: any[] = []
  private roomId: number;
  private socket: BroadcastOperator<DefaultEventsMap, any>;
  private users: Map<number, SocketInterface> = new Map();
  private coincidence: Map<number, Map<number, number>> = new Map();
  private listOfFavorites: any[] = [];
  private ratesForAction: Map<number, boolean> = new Map()
  constructor(roomId: number, socket: BroadcastOperator<DefaultEventsMap, any>,
    private readonly quizzService: QuizzService,
    private readonly roomService: RoomService,
    private readonly userService: UserService
  ) {
    this.roomId = roomId;
    this.socket = socket;
    this.init();
  }
  async init() {
    this.tryToStart()
  }
  async reset() {
    await this.roomService.reset(this.roomId)
  }
  async tryToStart() {
    if (this._tops.length && this._bottoms.length) {
      this.isStarted = true;
      this.nextGame();
    } else {
      setTimeout(this.tryToStart, 1000);
    }
    // if (room.bottomCount >= 1 && room.topCount >= 1 && !this.isStarted) {
    //  
    //   
    // }
    // if (room.members.length < 2) {
    //   this.isStarted = false;
    // }
  }

  async join(user: SocketInterface, side: string) {
    const room = await this.roomService.joinToRoom(this.roomId, user.user.id, side)
    if (side === "top") {
      this._tops.push({
        userId: user.user.id,
      })
    } else {
      this._bottoms.push({
        userId: user.user.id,
      })
    }
    await user.join(this.roomId.toString())
    this.users.set(user.user.id, user)
    user.emit("startGame", room)
    this.socket.emit("members", { top: this._tops, bottom: this._bottoms })
    this.addListeners(user);
  }

  async addListeners(client: SocketInterface) {
    client.on('answer_of_question', (data) => {
      this.answersOfQuestion.push(data);
    });
    client.on('rate', (data) => {

    });
    client.on('select_favorite', (data) => {
      this.listOfFavorites.push(data);
    });
    client.on('broadcast_video', (data) => {
      this.socket.emit("broadcast_video", data);
    })
    client.on('rate_action', (data) => {
      const { id, rate } = data;
      this.ratesForAction.set(id, rate);
    })
  }
  async leave(userId: number) {
    const side = await this.roomService.leave(this.roomId, userId);
    if (side === 'top') {
      this._tops = this._tops.filter(i => i.userId !== userId)
    } else {
      this._bottoms = this._bottoms.filter(i => i.userId !== userId)
    }
    this.users.get(userId).disconnect();
    this.socket.emit("members", { top: this._tops, bottom: this._bottoms })
  }

  async showForRate() {
    setTimeout(() => {
      const user = this.userService.getRandomUser()
      this.socket.emit('for_rate', user);
      this.nextGame();
    }, DURATIONS.betweenRounds);
  }
  async askQuestion() {
    const game = await this.quizzService.getRandomOne();
    this.socket.emit('round', { type: "question", game });
    this.answersOfQuestion = [];
    this.gameTimer = setTimeout(() => {
      this.socket.emit('receive_answers_of_question', this.answersOfQuestion);
      setTimeout(this.showForRate, DURATIONS.showResults);
    }, DURATIONS.question);
  }
  async chooseFavorites() {
    this.socket.emit('round', { type: "chooseFavorites" });
    this.listOfFavorites = [];
    this.gameTimer = setTimeout(() => {
      this.socket.emit('selected_favorites', this.listOfFavorites);
      setTimeout(this.showForRate, DURATIONS.showResults);
    }, DURATIONS.choose);
  }
  randomFromList(list: any[]) {
    return list[Math.floor(list.length * Math.random())];
  }
  async action(side: string) {
    const user = side === "top" ? this.randomFromList(this._tops) : this.randomFromList(this._bottoms)
    let actionName = "Dance!"
    this.socket.emit('round', { type: "action", action: actionName, userId: user.userId });
    this.ratesForAction = new Map();
    this.gameTimer = setTimeout(() => {
      this.socket.emit('action_rates', this.ratesForAction);
      setTimeout(this.showForRate, DURATIONS.showResults);
    }, DURATIONS.action);
  }
  async karaoke() {
    let actionName = "Dance!"
    this.socket.emit('round', { type: "karaoke", action: actionName });
    this.ratesForAction = new Map();
    this.gameTimer = setTimeout(() => {
      this.socket.emit('action_rates', this.ratesForAction);
      setTimeout(this.showForRate, DURATIONS.showResults);
    }, DURATIONS.action);
  }
  async nextGame() {
    const type = Math.floor(Math.random() * 4);
    switch (type) {
      case 0:
        this.askQuestion()
        break;
      case 1:
        this.chooseFavorites()
        break;
      case 2:
        this.action("top")
        break;
      case 3:
        this.action("bottom")
        break;
      default:
        break;
    }
  }

  async stopGame(room: Room) {

  }
}
