import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'src/user/user.entity';
import { Repository } from 'typeorm';
import { MemberStatus, Room } from './room.entity';

@Injectable()
export class RoomService {
  constructor(
    @InjectRepository(Room) private readonly roomRepository: Repository<Room>,
    @InjectRepository(User) private readonly userRepository: Repository<User>,
  ) { }

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
  async getFreeRooms(side: string) {
    const query = await this.roomRepository.query(
      `SELECT room.id from room left join (SELECT id, count(*) FROM room,json_array_elements(members) with ordinality arr(member, position) WHERE arr.member->>'side' = '${side}' and arr.member->>'status' = '0' group by id) l on l.id = room.id where count <6 or count is null order by random() limit 1`);
    return query
  }

  async joinToRoom(roomId, userId, side) {
    const room = await this.roomRepository.findOneBy({ id: roomId });
    if (room) {
      const members = room.members ? room.members : []
      const index = members.findIndex(i => i.userId === userId)
      if (index > -1) {
        members[index].status = MemberStatus.InGame
      } else {
        members.push({
          userId,
          side,
          status: MemberStatus.InGame
        })
      }
      room.members = members;
      await this.roomRepository.save(room);
      const user = await this.userRepository.findOneBy({ id: userId })
      user.activeRoomId = room.id;
      await this.userRepository.save(user);
    }
    return room
  }
  async reset(id): Promise<Room> {
    const room = await this.roomRepository.findOneBy({ id });
    if (room && room.members) {
      room.members = room.members.map(i => ({ ...i, status: MemberStatus.Leave }))
    }
    await this.roomRepository.save(room);
    return room
  }
  async leave(roomId, userId) {
    const room = await this.roomRepository.findOneBy({ id: roomId });
    let result = "";
    if (room && room.members) {
      room.members = room.members.map(i => {
        if (i.userId === userId) {
          i.status = MemberStatus.Leave;
          result = i.side;
        }
        return i;
      })
      await this.roomRepository.save(room);
    }

    return result
  }
  async roomForMans() {
    const query = this.roomRepository.createQueryBuilder('rooms');
    const room = await query
      .andWhere('rooms.bottomCount < :max', { max: +process.env.ROOM_MAX })
      .getOne();
    return room;
  }
  async cretaeEmptyRoom() {
    const newRoom = await this.roomRepository.save(new Room());
    return newRoom;
  }
  async deleteRoom(id: number) {
    const room = await this.roomRepository.findOneBy({ id });
    if (room) {
      await this.roomRepository.delete(id);
      return `Room ${room.id} deleted`;
    }
    throw new NotFoundException('Room not found!');
  }

  // async joinToRandom(user: User) {
  //   if (user.sex === 1) {
  //     const room = await this.roomForGirls();
  //     if (!room) {
  //       return this.createRoomAndJoin(user);
  //     }
  //     const isMember = room.members.find(
  //       (member) => member.user.id === user.id,
  //     );
  //     if (isMember) {
  //       return room;
  //     }
  //     room.members.push({ user, side: 'top' });
  //     user.activeRoomId = room.id;
  //     await this.userRepository.save(user);
  //     return await this.roomRepository.save(room);
  //   }
  //   const room = await this.roomForMans();
  //   if (!room) {
  //     //return this.createRoomAndJoin(user);
  //   }
  //   const isMember = room.members.find((member) => member.user.id === user.id);
  //   if (isMember) {
  //     return room;
  //   }
  //   room.members.push({ user, side: 'bottom' });
  //   user.activeRoomId = room.id;
  //   await this.userRepository.save(user);
  //   return await this.roomRepository.save(room);
  // }

  //   async createRoomAndJoin(user: User) {
  //     const room = new Room();
  //     room.members = [];
  //     if (user.sex === 1) {
  //       room.members.push({ user, side: 'top' });
  //       const newRoom = await this.roomRepository.save(room);
  //       user.activeRoomId = newRoom.id;
  //       await this.userRepository.save(user);
  //       return newRoom;
  //     }
  //     room.members.push({ userId:user.id, side: 'bottom' });
  //     const newRoom = await this.roomRepository.save(room);
  //     user.activeRoomId = newRoom.id;
  //     await this.userRepository.save(user);
  //     return newRoom;
  //   }

  //   async removeMember(user: User) {
  //     const room = await this.roomRepository.findOne({
  //       where: { id: user.activeRoomId },
  //     });
  //     if (room) {
  //       const index = room.members.findIndex(
  //         (member) => member.userId === user.id,
  //       );
  //       if (index > -1) {
  //         room.members.splice(index, 1);
  //         if (user.sex === 1) {
  //           user.activeRoomId = null;
  //           await this.userRepository.save(user);
  //           return await this.roomRepository.save(room);
  //         }
  //         user.activeRoomId = null;
  //         await this.userRepository.save(user);
  //         return await this.roomRepository.save(room);
  //       }
  //     }
  //   }
}
