import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { QuizzDto } from './quizz.dto';
import { Quizz } from './quizz.entity';

@Injectable()
export class QuizzService {
  constructor(
    @InjectRepository(Quizz)
    private readonly quizzRepository: Repository<Quizz>,
  ) {}

  public async getAll() {
    return await this.quizzRepository.find();
  }

  public async getRandomOne() {
    const favorites = await this.getAll();
    return favorites[Math.floor(Math.random() * favorites.length)];
  }

  public async addQuestion(
    quizz: QuizzDto,
    pictures: Array<Express.Multer.File>,
  ) {
    const newQuizz = this.quizzRepository.create(quizz);
    newQuizz.pictures = pictures.map((pic) => `/pictures/${pic.filename}`);
    return await this.quizzRepository.save(newQuizz);
  }

  public async deleteQuestion(id: number) {
    const question = await this.quizzRepository.findOneBy({ id });
    if (!question) {
      throw new NotFoundException('Question not Found!');
    }
    return await this.quizzRepository.delete(id);
  }

  public async editQuestion(
    id: number,
    quizzDto: QuizzDto,
    pictures: Array<Express.Multer.File>,
  ) {
    const quizz = await this.quizzRepository.findOneBy({ id });
    if (!quizz) {
      throw new NotFoundException('Question Not Found');
    }
    quizz.question = quizzDto.question;
    quizz.pictures = pictures.map((pic) => `/pictures/${pic.filename}`);
    return await this.quizzRepository.save(quizz);
  }
}
