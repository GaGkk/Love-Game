import { Controller, Body, Put, Param, Get, Delete,Post } from '@nestjs/common';
import { UserDto } from './createUser.dto';
import { UserService } from './user.service';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post('/login')
  async login(@Body('socialId') socialId: number,@Body('socialType') socialType: string) {
    
   return this.userService.login(socialId, socialType);
  }
  @Get('/all')
  async getAll() {
    return this.userService.getUsers();
  }

  @Get('/getUser/:id')
  async get(@Param('id') socialId: string, userDto: UserDto) {
    return this.userService.getUser(socialId, userDto);
  }

  @Put('/:id')
  async update(@Body() userDto: UserDto, @Param('id') id: number) {
    return this.userService.updateUser(userDto, id);
  }

  @Delete('/:id')
  async delete(@Param('id') id: number) {
    return this.userService.deleteUser(id);
  }
}
