import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { WsException } from '@nestjs/websockets';
import { verify } from 'jsonwebtoken';
import { Socket } from 'socket.io';
import { User } from 'src/user/user.entity';
import { Repository } from 'typeorm';
import { Room } from './room.entity';

@Injectable()
export class RoomService {
  constructor(
    @InjectRepository(Room) private readonly roomRepository: Repository<Room>,
    @InjectRepository(User) private readonly userRepository: Repository<User>,
  ) {}

  private async addMember(user: User, room: Room) {
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

  async removeMember(client: Socket) {
    const bearerToken = client.handshake.headers.authorization.split(' ')[1];
    if (!bearerToken) {
      throw new WsException('Token is required');
    }
    const decode = verify(bearerToken, process.env.JWT_SECRET);
    const user = await this.userRepository.findOne({
      where: { socialId: decode.toString() },
    });
    const room = await this.roomRepository.findOne({
      where: { id: user.activeRoomId },
    });
    const index = room.members.findIndex((leave) => leave.user.id === user.id);
    if (index >= 0) {
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
      room.topCount++;
      user.activeRoomId = room.id;
      await this.userRepository.save(user);
      return await this.roomRepository.save(room);
    }
    const room = await this.roomForMans();
    if (room === null) {
      return this.createRoom(user);
    }
    room.members.push({ user, side: 'bottom' });
    room.bottomCount++;
    user.activeRoomId = room.id;
    await this.userRepository.save(user);
    return await this.roomRepository.save(room);
  }

  async addMemberToRoom(roomId: number, user: User) {
    const room = await this.roomRepository.findOneBy({ id: roomId });
    return this.addMember(user, room);
  }
}
