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
  @UseInterceptors(FilesInterceptor('pictures', 3, fileOptions))
  public async addQuestion(
    @Body() quizz: QuizzDto,
    @UploadedFiles() pictures: Array<Express.Multer.File>,
  ) {
    return await this.quizzService.addQuestion(quizz, pictures);
  }

  @Put('/:id')
  @UseInterceptors(FilesInterceptor('pictures', 3, fileOptions))
  public async editQuestion(
    @Param('id') id: number,
    @Body() quizz: QuizzDto,
    @UploadedFiles() pictures: Array<Express.Multer.File>,
  ) {
    return await this.quizzService.editQuestion(id, quizz, pictures);
  }

  @Delete('/:id')
  public async deleteOne(@Param('id') id: number) {
    return await this.quizzService.deleteQuestion(id);
  }
}
