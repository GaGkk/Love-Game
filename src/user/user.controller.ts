import { Controller, Body, Post, Param, Get, Delete } from '@nestjs/common';
import { UserDto } from './createUser.dto';
import { UserService } from './user.service';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get('/all')
  async getAll() {
    return this.userService.getUsers();
  }

  @Get('/getUser/:id')
  async get(@Param('id') socialId: string, userDto: UserDto) {
    return this.userService.getUser(socialId, userDto);
  }

  @Post('/:id')
  async update(@Body() userDto: UserDto, @Param('id') id: number) {
    return this.userService.updateUser(userDto, id);
  }

  @Delete('/:id')
  async delete(@Param('id') id: number) {
    return this.userService.deleteUser(id);
  }
}
