import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('User')
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ nullable: true })
  firstName: string;

  @Column({ nullable: true })
  lastName: string;

  @Column({ nullable: true })
  avatar: string;

  @Column({ nullable: true })
  cover: string;

  @Column({ nullable: true })
  age: number;

  @Column({ nullable: true })
  sex: number;

  @Column('simple-json', { nullable: true })
  address: {
    country: string;
    city: string;
  };

  @Column()
  socialId: string;

  @Column({ nullable: true })
  activeRoomId: number;
}
