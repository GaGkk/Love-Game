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
      const user = await this.userRepository.save(newProfile);
      return { token: jwt, user };
    }
    return { token: jwt, user };
  }

  async updateUser(userDto: UserDto, id: number) {
    const user = await this.userRepository.findOneBy({ id });
    if (user) {
      const jwt = sign(user.socialId, process.env.JWT_SECRET);
      Object.assign(user, userDto);
      const updatedUser = await this.userRepository.save(user);
      return { token: jwt, user: updatedUser };
    }
    throw new NotFoundException('User not Found');
  }

  async getUserbySocialId(socialId: string) {
    return await this.userRepository.findOneBy({ socialId });
  }

  async getUsers() {
    return await this.userRepository.find();
  }

  async deleteUser(id: number) {
    const user = this.userRepository.findOneBy({ id });
    if (!user) {
      throw new NotFoundException('User not Found!');
    }
    return await this.userRepository.delete(id);
  }
}
