import { Body, Controller, Get, Param, Post } from '@nestjs/common';

import { CreateMessageDto } from './dto/create-message.dto';
import { MessageService } from './message.service';

@Controller('messages')
export class MessageController {
  constructor(private readonly messageService: MessageService) {}

  @Get('/room/:id')
  getMessages(@Param('id') roomId: number) {
    return this.messageService.getMessages(roomId);
  }

  @Post()
  createMessages(@Body() createMessageDto: CreateMessageDto) {
    return this.messageService.createMessage(createMessageDto);
  }
}
