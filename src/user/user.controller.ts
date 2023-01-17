import { Controller, Body, Post } from '@nestjs/common';
import { UserService } from './user.service';

export interface vkDto {
  userId: number;
  accessToken: string;
}

@Controller()
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post('/getUser')
  async authorize(@Body() { userId, accessToken }: vkDto) {
    return this.userService.getUserInfo({ userId, accessToken });
  }
}
