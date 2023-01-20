import { Controller, Post, Get, Body } from '@nestjs/common';
import { RoomService } from './room.service';

@Controller('room')
export class RoomController {
  constructor(private readonly roomService: RoomService) {}

  @Get()
  async getAll() {
    return await this.roomService.getRooms();
  }

  @Post()
  async createRoom(@Body() roomDto: { userId: number; gender: number }) {
    return await this.roomService.createRoom(roomDto);
  }
}
