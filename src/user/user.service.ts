import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './user.entity';
import { vkDto } from './user.controller';
import { sign } from 'jsonwebtoken';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async createUser({ userId, accessToken }: vkDto) {
    const url = `https://api.vk.com/method/users.get?user_ids=${userId}&access_token=${accessToken}&v=5.190`;
    const response = await fetch(url);
    const userInfo = await response.json();
    const jwt = sign(userInfo.response[0].id, process.env.JWT_SECRET);
    return { token: jwt };
  }
}
