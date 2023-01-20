import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class Room {
  @PrimaryGeneratedColumn()
  id: number;

  @Column('jsonb', { nullable: true })
  messages: {
    from: number;
    message: string;
    createdAt: Date;
  }[];

  @Column('jsonb', { nullable: true })
  members: {
    side: string;
    userId: number;
  }[];
}
