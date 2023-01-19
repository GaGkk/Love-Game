import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from 'src/user/user.entity';
import { UserService } from 'src/user/user.service';
import { GameGateway } from './game.gateway';
import { RoomController } from './room.controller';
import { Room } from './room.entity';
import { RoomService } from './room.service';

@Module({
  imports: [TypeOrmModule.forFeature([Room, User])],
  controllers: [RoomController],
  providers: [RoomService, UserService, GameGateway],
  exports: [RoomService],
})
export class RoomModule {}
