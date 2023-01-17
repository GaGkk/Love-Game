import {
  Column,
  Entity,
  ManyToMany,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';

import { Message } from '../message/message.entity';
import { Room } from '../room/room.entity';

@Entity('User')
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @OneToMany(() => Message, (message) => message.owner)
  messages: Message[];

  @OneToMany(() => Room, (room) => room.owner)
  rooms: Room[];

  @ManyToMany(() => Room, (room) => room.members)
  joinedRooms: Room[];
}
