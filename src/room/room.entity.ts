import { User } from 'src/user/user.entity';
import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

enum ROOMTYPE {
  special,
  generous,
  sociable,
  musical,
  pages,
}

export enum MemberStatus {
  InGame,
  Leave,
}

interface Member {
  userId:number,
  side:string,
  status:MemberStatus,
}
@Entity()
export class Room {
  @PrimaryGeneratedColumn()
  id: number;

  
  @Column('json', { nullable: true })
  members: Member[];
}
