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

  @Post('/getUser')
  async get(@Body() userDto: UserDto) {
    return this.userService.getUser(userDto);
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
