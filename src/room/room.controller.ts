import { Controller, Post, Get, Param } from '@nestjs/common';
import { currentUser } from 'src/user/user.decorator';
import { User } from 'src/user/user.entity';
import { RoomService } from './room.service';

@Controller('room')
export class RoomController {
  constructor(private readonly roomService: RoomService) {}

  @Get()
  async getAll() {
    return this.roomService.getRooms();
  }

  @Post('/:id')
  async addMember(@Param('id') roomId: number, @currentUser() user: User) {
    return await this.roomService.addMemberToRoom(roomId, user);
  }
}
