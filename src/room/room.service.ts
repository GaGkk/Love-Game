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

  async addMemberToRoom(roomDto: { roomId: number; userId: number }) {
    const room = await this.roomRepository.findOneBy({ id: roomDto.roomId });
    room.members.push({ userId: roomDto.userId, side: 'top' });
    return await this.roomRepository.save(room);
  }

  async notEmptyRoom() {
    const { members } = await this.roomRepository
      .createQueryBuilder('rooms')
      .select()
      .andWhere('members ::jsonb @> :members', {
        members: JSON.stringify([
          {
            side: 'top',
          },
        ]),
      })
      .andWhere('jsonb_array_length("rooms".members) < 12')
      .getOne();

    const roomLength = members.length;
    const girlCount = members.filter((member) => member.side == 'top').length;
    const manCount = members.filter((member) => member.side == 'bottom').length;
    return { roomLength, girlCount, manCount };
  }
}
