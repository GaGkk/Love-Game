import { MiddlewareConsumer, Module, RequestMethod } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import db from './orm.config';
import { UserModule } from './user/user.module';
import { GameGateway } from './room/game.gateway';
import { ConfigModule } from '@nestjs/config';
import { RoomModule } from './room/room.module';
import { AuthMiddleWare } from './user/middlewares/auth.middleware';

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
export class AppModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(AuthMiddleWare).forRoutes({
      path: '*',
      method: RequestMethod.ALL,
    });
  }
}
