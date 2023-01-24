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
    const [questions, count] = await this.quizzRepository.findAndCount();
    return { questions, count };
  }

  public async addQuestion(quizz: QuizzDto) {
    const newQuizz = this.quizzRepository.create(quizz);
    return await this.quizzRepository.save(newQuizz);
  }

  public async deleteQuestion(id: number) {
    const question = await this.quizzRepository.findOneBy({ id });
    if (!question) {
      throw new NotFoundException('Question not Found!');
    }
    return await this.quizzRepository.delete(id);
  }

  public async addQuestionAnswers(
    id: number,
    pictures: Array<Express.Multer.File>,
  ) {
    const question = await this.quizzRepository.findOneBy({ id });
    if (!question) {
      throw new NotFoundException('Question Not Found');
    }
    question.pictures = pictures.map((pic) => `pictures/${pic.filename}`);
    return await this.quizzRepository.save(question);
  }
}
