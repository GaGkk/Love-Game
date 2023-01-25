import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { QuizzController } from './quizz.controller';
import { Quizz } from './quizz.entity';
import { QuizzService } from './quizz.service';

@Module({
  imports: [TypeOrmModule.forFeature([Quizz])],
  controllers: [QuizzController],
  providers: [QuizzService],
  exports: [QuizzService],
})
export class QuizzModule {}
