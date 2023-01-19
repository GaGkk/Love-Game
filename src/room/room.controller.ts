import { Controller, Post, Get, Body } from '@nestjs/common';
import { RoomService } from './room.service';

@Controller('room')
export class RoomController {
  constructor(private readonly roomService: RoomService) {}

  @Get()
  async getAll() {
    const rooms = await this.roomService.getRooms();
    console.log(rooms.length);
  }
}
