import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';

import { Room } from '../room/room.entity';

@Entity('User')
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ nullable: true })
  name: string;

  @Column({ nullable: true })
  avatar: string;

  @ManyToOne(() => Room, (room) => room.members)
  activeRoom: Room;
}
