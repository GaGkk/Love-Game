import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { QuizzService } from 'src/quizz/quizz.service';
import { User } from 'src/user/user.entity';
import { Repository } from 'typeorm';
import { Room } from './room.entity';

@Injectable()
export class RoomService {
  constructor(
    @InjectRepository(Room) private readonly roomRepository: Repository<Room>,
    @InjectRepository(User) private readonly userRepository: Repository<User>,
    private readonly quizzService: QuizzService,
  ) {}

  private games = ['favorites'];

  async getRandomGame() {
    const type = Math.floor(Math.random() * this.games.length);
    if (type === 0) {
      const game = await this.quizzService.getRandomOne();
      return { type, game };
    }
  }

  async getRooms() {
    return await this.roomRepository.find();
  }

  async roomForGirls() {
    const query = this.roomRepository.createQueryBuilder('rooms');
    const room = await query
      .andWhere('rooms.topCount < :max', { max: +process.env.ROOM_MAX })
      .getOne();
    return room;
  }

  async roomForMans() {
    const query = this.roomRepository.createQueryBuilder('rooms');
    const room = await query
      .andWhere('rooms.bottomCount < :max', { max: +process.env.ROOM_MAX })
      .getOne();
    return room;
  }

  async deleteRoom(id: number) {
    const room = await this.roomRepository.findOneBy({ id });
    if (room) {
      await this.roomRepository.delete(id);
      return `Room ${room.id} deleted`;
    }
    throw new NotFoundException('Room not found!');
  }

  async joinToRandom(user: User) {
    if (user.sex === 1) {
      const room = await this.roomForGirls();
      if (!room) {
        return this.createRoomAndJoin(user);
      }
      const isMember = room.members.find(
        (member) => member.user.id === user.id,
      );
      if (isMember) {
        return room;
      }
      room.members.push({ user, side: 'top' });
      room.topCount++;
      user.activeRoomId = room.id;
      await this.userRepository.save(user);
      return await this.roomRepository.save(room);
    }
    const room = await this.roomForMans();
    if (!room) {
      return this.createRoomAndJoin(user);
    }
    const isMember = room.members.find((member) => member.user.id === user.id);
    if (isMember) {
      return room;
    }
    room.members.push({ user, side: 'bottom' });
    room.bottomCount++;
    user.activeRoomId = room.id;
    await this.userRepository.save(user);
    return await this.roomRepository.save(room);
  }

  async createRoomAndJoin(user: User) {
    const room = new Room();
    room.members = [];
    room.messages = [];
    room.bottomCount = 0;
    room.topCount = 0;

    if (user.sex === 1) {
      room.members.push({ user, side: 'top' });
      room.topCount++;
      const newRoom = await this.roomRepository.save(room);
      user.activeRoomId = newRoom.id;
      await this.userRepository.save(user);
      return newRoom;
    }
    room.members.push({ user, side: 'bottom' });
    room.bottomCount++;
    const newRoom = await this.roomRepository.save(room);
    user.activeRoomId = newRoom.id;
    await this.userRepository.save(user);
    return newRoom;
  }

  async removeMember(user: User) {
    const room = await this.roomRepository.findOne({
      where: { id: user.activeRoomId },
    });
    if (room) {
      const index = room.members.findIndex(
        (member) => member.user.id === user.id,
      );
      if (index > -1) {
        room.members.splice(index, 1);
        if (user.sex === 1) {
          room.topCount--;
          user.activeRoomId = null;
          await this.userRepository.save(user);
          return await this.roomRepository.save(room);
        }
        room.bottomCount--;
        user.activeRoomId = null;
        await this.userRepository.save(user);
        return await this.roomRepository.save(room);
      }
    }
  }
}
