import { Controller, Get, Param, Delete } from '@nestjs/common';
import { RoomService } from './room.service';

@Controller('room')
export class RoomController {
  constructor(private readonly roomService: RoomService) {}

  @Get()
  async getAll() {
    return this.roomService.getRooms();
  }

  @Delete('/:id')
  async deleteRoom(@Param('id') id: number) {
    return await this.roomService.deleteRoom(id);
  }
}
