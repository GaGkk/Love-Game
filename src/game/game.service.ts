import { Injectable } from '@nestjs/common';
import { QuizzService } from 'src/quizz/quizz.service';

@Injectable()
export class GameService {
  constructor(private readonly quizzService: QuizzService) {}

  private games = ['favorites'];

  async getRandomGame() {
    const type = Math.floor(Math.random() * this.games.length);
    if (type === 0) {
      const game = await this.quizzService.getRandomOne();
      return { type, game };
    }
  }
}
