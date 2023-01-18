import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './user.entity';
import { sign } from 'jsonwebtoken';
import { UserDto } from './createUser.dto';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async getUser(userDto: UserDto) {
    const user = await this.userRepository.findOne({
      where: { socialId: userDto.socialId },
    });
    const jwt = sign(userDto.socialId, process.env.JWT_SECRET);
    if (!user) {
      const newProfile = this.userRepository.create(userDto);
      const profile = await this.userRepository.save(newProfile);
      return { accessToken: jwt, profile };
    }
    return { token: jwt, user };
  }

  async updateUser(userDto: UserDto, id: number) {
    const user = await this.userRepository.findOneBy({ id });
    if (user) {
      Object.assign(user, userDto);
      return this.userRepository.save(user);
    }
    throw new NotFoundException('User not Found');
  }
}
