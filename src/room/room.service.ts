import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Room } from './room.entity';

@Injectable()
export class RoomService {
  constructor(
    @InjectRepository(Room) private readonly roomRepository: Repository<Room>,
  ) {}

  async createRoom(roomDto: { userId: number; gender: number }) {
    const room = new Room();
    room.members = [];
    room.messages = [];
    if (roomDto.gender == 1) {
      room.members.push({ userId: roomDto.userId, side: 'top' });
    } else {
      room.members.push({ userId: roomDto.userId, side: 'bottom' });
    }
    return this.roomRepository.save(room);
  }

  async getRooms() {
    return await this.roomRepository.find();
  }
}
