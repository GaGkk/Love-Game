import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './user.entity';
import { vkDto } from './user.controller';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async getUserInfo({ userId, accessToken }: vkDto) {
    const url = `https://api.vk.com/method/users.get?user_ids=${userId}&fields=photo_200,bdate,sex&access_token=${accessToken}&v=5.190`;
    const response = await fetch(url);
    const userInfo = await response.json();
    return userInfo.response[0];
  }
}
