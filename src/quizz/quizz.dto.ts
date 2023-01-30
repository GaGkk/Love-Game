import { IsNotEmpty } from 'class-validator';

export class QuizzDto {
  @IsNotEmpty()
  readonly question: string;

  @IsNotEmpty()
  readonly pictures: string[];

  readonly visible: boolean;

  @IsNotEmpty()
  readonly category: number;
}
