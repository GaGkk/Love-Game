import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import db from './orm.config';
import { UserModule } from './user/user.module';
import { ChatGateway } from './chat/chat.gateway';
import { ChatModule } from './chat/chat.module';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, envFilePath: '.env' }),
    TypeOrmModule.forRoot(db.options),
    UserModule,
    ChatModule,
  ],
  controllers: [],
  providers: [ChatGateway],
})
export class AppModule {}
