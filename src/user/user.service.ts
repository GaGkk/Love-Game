import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './user.entity';
import { sign, verify ,JwtPayload} from 'jsonwebtoken';
import { UserDto } from './createUser.dto';
import { SocketInterface } from 'src/interface/socket.interface';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}


  async  login(socialId:number,socialType:string) {
    const user = await this.userRepository.findOne({
      where: { socialId: socialId },
    });
    const jwt = sign({id:socialId}, process.env.JWT_SECRET);
    if(!user){
      const newProfile = this.userRepository.create({
        ...new UserDto(),
        socialId: +socialId,
      });
      const user = await this.userRepository.save(newProfile);
      return { token: jwt, user };
    }
    return { token: jwt, user };


   
  }
  async getRandomUser(){
    const user = await this.userRepository.query('SELECT id FROM "users" "motivation" ORDER BY RANDOM() ASC LIMIT 1');
    return user;
  }
  async getUser(socialId: string, userDto: UserDto) {
    const user = await this.userRepository.findOne({
      where: { socialId: +socialId },
    });
    const jwt = sign(socialId, process.env.JWT_SECRET);
    if (!user) {
      const newProfile = this.userRepository.create({
        ...userDto,
        socialId: +socialId,
      });
      const user = await this.userRepository.save(newProfile);
      return { token: jwt, user };
    }
    return { token: jwt, user };
  }

  async getUserFromSocket(socket: SocketInterface) {
    const bearerToken = socket.handshake.headers.authorization;
    console.log(bearerToken);
    
    if (!bearerToken) {
      socket.user = null;
      return socket;
    }
    const token = bearerToken.split(' ')[1];
    try {
      const decode:any = verify(token, process.env.JWT_SECRET);
      console.log(decode);
      
      const user = await this.getUserbySocialId(decode.id);
      
      socket.user = user;
      return socket;
    } catch {
      socket.user = null;
      return socket;
    }
  }

  async updateUser(userDto: UserDto, id: number) {
    const user = await this.userRepository.findOneBy({ id });
    if (user) {
      Object.assign(user, userDto);
      await this.userRepository.save(user);
      const updatedUser = await this.getUser(user.socialId.toString(), userDto);
      return { ...updatedUser };
    }
    throw new NotFoundException('User not Found');
  }

  async getUserbySocialId(socialId: number) {
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
