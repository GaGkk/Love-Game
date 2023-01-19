import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Room } from './room.entity';

@Injectable()
export class RoomService {
  constructor(
    @InjectRepository(Room) private readonly roomRepository: Repository<Room>,
  ) {}

  async createRoom(userId: number, gender: number) {
    const room = new Room();
    if (gender == 1) {
      room.members.push({ userId, side: 'top' });
    }
    room.members.push({ userId, side: 'bottom' });

    // const message = {
    //   ...roomDto,
    //   createdAt: new Date(),
    // };

    return this.roomRepository.save(room);
  }

  async getRooms() {
    const rooms = await this.roomRepository.find();
    const memb = rooms.map((e) => e.members);
    console.log(rooms);
    return await this.roomRepository.find();
  }
}
