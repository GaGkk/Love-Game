import { Controller, Post, Get, Body } from '@nestjs/common';
import { RoomService } from './room.service';

@Controller('room')
export class RoomController {
  constructor(private readonly roomService: RoomService) {}

  @Get()
  async getAll() {
    return await this.roomService.notEmptyRoom();
  }

  @Post()
  async createRoom(@Body() roomDto: { userId: number; gender: number }) {
    return await this.roomService.createRoom(roomDto);
  }

  @Post('/member')
  async addMember(@Body() roomDto: { roomId: number; userId: number }) {
    return await this.roomService.addMemberToRoom(roomDto);
  }
}
