import { IsNotEmpty } from 'class-validator';

export class UserDto {
  readonly firstName: string;
  readonly lastName: string;
  readonly avatar: string;
  readonly age: number;
  readonly sex: number;
  readonly address: {
    country: string;
    city: string;
  };

  @IsNotEmpty()
  readonly socialId: string;
  readonly activeRoomId: number;
}
