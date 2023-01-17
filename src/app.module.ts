import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import db from './orm.config';
import { UserModule } from './user/user.module';
import { ChatGateway } from './chat/chat.gateway';
import { MessageModule } from './message/message.module';

@Module({
  imports: [TypeOrmModule.forRoot(db.options), UserModule, MessageModule],
  controllers: [],
  providers: [ChatGateway],
})
export class AppModule {}
