import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'src/user/user.entity';
import { Repository } from 'typeorm';
import { Room } from './room.entity';

@Injectable()
export class RoomService {
  constructor(
    @InjectRepository(Room) private readonly roomRepository: Repository<Room>,
  ) {}

  private async addMember(user: User, room: Room) {
    if (user.sex === 1) {
      room.members.push({ user, side: 'top' });
      room.topCount++;
      return await this.roomRepository.save(room);
    }
    room.members.push({ user, side: 'bottom' });
    room.bottomCount++;
    return await this.roomRepository.save(room);
  }

  async getRooms() {
    return await this.roomRepository.find();
  }

  async roomForGirls() {
    const query = this.roomRepository.createQueryBuilder('rooms');
    const room = await query
      .andWhere('room.topCount < :max', { max: 6 })
      .getOne();
    return room;
  }

  async roomForMans() {
    const query = this.roomRepository.createQueryBuilder('rooms');
    const room = await query
      .andWhere('rooms.bottomCount < :max', { max: 6 })
      .getOne();
    return room;
  }

  async createRoom(user: User) {
    const room = new Room();
    room.members = [];
    room.messages = [];
    room.bottomCount = 0;
    room.topCount = 0;
    return this.addMember(user, room);
  }

  async joinToRandom(user: User) {
    if (user.sex === 1) {
      const room = await this.roomForGirls();
      if (room === null) {
        return this.createRoom(user);
      }
      room.members.push({ user, side: 'top' });
      room.topCount = room.topCount + 1;
      return await this.roomRepository.save(room);
    }
    const room = await this.roomForMans();
    if (room === null) {
      return this.createRoom(user);
    }
    room.members.push({ user, side: 'bottom' });
    room.bottomCount = room.bottomCount + 1;
    return await this.roomRepository.save(room);
  }

  async addMemberToRoom(roomId: number, user: User) {
    const room = await this.roomRepository.findOneBy({ id: roomId });
    return this.addMember(user, room);
  }
}
