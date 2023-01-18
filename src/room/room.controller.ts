import { Controller, Post, Get, Body } from '@nestjs/common';
import { RoomDto } from './room.dto';
import { RoomService } from './room.service';

@Controller('room')
export class RoomController {
  constructor(private readonly roomService: RoomService) {}

  @Post()
  async addMessage(@Body() roomDto: RoomDto) {
    return await this.roomService.createMessage(roomDto);
  }
}
