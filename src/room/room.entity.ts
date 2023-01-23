import { User } from 'src/user/user.entity';
import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

enum ROOMTYPE {
  special,
  generous,
  sociable,
  musical,
  pages,
}

@Entity()
export class Room {
  @PrimaryGeneratedColumn()
  id: number;

  @Column('json', { nullable: true })
  messages: {
    from: number;
    message: string;
    createdAt: Date;
  }[];

  @Column('json', { nullable: true })
  members: {
    side: string;
    user: User;
  }[];

  @Column({ default: 0 })
  topCount: number;

  @Column({ default: 0 })
  bottomCount: number;
}
