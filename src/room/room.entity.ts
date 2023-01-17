import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';

import { User } from '../user/user.entity';

@Entity()
export class Room {
  @PrimaryGeneratedColumn()
  id: number;

  @Column('jsonb', { array: true })
  messages: object[];

  @OneToMany(() => User, (user) => user.activeRoom)
  members: User[];
}
