import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import db from './orm.config';
import { UserModule } from './user/user.module';
import { GameGateway } from './room/game.gateway';
import { ConfigModule } from '@nestjs/config';
import { RoomModule } from './room/room.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, envFilePath: '.env' }),
    TypeOrmModule.forRoot(db.options),
    UserModule,
    RoomModule,
  ],
  controllers: [],
  providers: [GameGateway],
})
export class AppModule {}
