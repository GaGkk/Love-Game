import {
  Controller,
  Body,
  Param,
  Get,
  Post,
  Put,
  Delete,
  UploadedFiles,
  UseInterceptors,
} from '@nestjs/common';
import { QuizzService } from './quizz.service';
import { fileOptions } from 'src/utils/fileUpload';
import { FilesInterceptor } from '@nestjs/platform-express';
import { QuizzDto } from './quizz.dto';

@Controller('questions')
export class QuizzController {
  constructor(private readonly quizzService: QuizzService) {}

  @Get('/all')
  public async getQuestions() {
    return await this.quizzService.getAll();
  }

  @Post()
  public async addQuestion(@Body() quizz: QuizzDto) {
    return await this.quizzService.addQuestion(quizz);
  }

  @Put('/:id')
  @UseInterceptors(FilesInterceptor('pictures', 3, fileOptions))
  public async addAnswers(
    @Param('id') id: number,
    @UploadedFiles() pictures: Array<Express.Multer.File>,
  ) {
    return await this.quizzService.addQuestionAnswers(id, pictures);
  }

  @Delete('/:id')
  public async deleteOne(@Param('id') id: number) {
    return await this.quizzService.deleteQuestion(id);
  }
}
