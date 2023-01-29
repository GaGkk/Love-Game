import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Quizz } from 'src/quizz/quizz.entity';
import { QuizzService } from 'src/quizz/quizz.service';
import { User } from 'src/user/user.entity';
import { UserService } from 'src/user/user.service';
import { RoomController } from './room.controller';
import { Room } from './room.entity';
import { RoomService } from './room.service';

@Module({
  imports: [TypeOrmModule.forFeature([Room, User, Quizz])],
  controllers: [RoomController],
  providers: [RoomService, UserService, QuizzService],
  exports: [RoomService],
})
export class RoomModule {}
