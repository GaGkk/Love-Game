import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('QuizzGame')
export class Quizz {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  question: string;

  @Column({
    type: 'simple-array',
    nullable: true,
  })
  pictures: string[];

  @Column({ default: true })
  visible: boolean;

  @Column()
  category: number;
}
