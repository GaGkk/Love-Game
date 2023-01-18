import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class Room {
  @PrimaryGeneratedColumn()
  id: number;

  @Column('jsonb', { nullable: true })
  messages: object[];

  @Column('jsonb', { nullable: true })
  members: object[];
}
