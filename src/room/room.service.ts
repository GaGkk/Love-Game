import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { RoomDto } from './room.dto';
import { Room } from './room.entity';

@Injectable()
export class RoomService {
  constructor(
    @InjectRepository(Room) private readonly roomRepository: Repository<Room>,
  ) {}

  async createMessage(roomDto: RoomDto) {
    const room = new Room();
    const message = {
      ...roomDto,
      createdAt: new Date(),
    };
    room.messages = [];
    room.members = [];
    room.messages.push(message);
    this.roomRepository.save(room);
  }
}
