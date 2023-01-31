import { MiddlewareConsumer, Module, RequestMethod } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import db from './orm.config';
import { UserModule } from './user/user.module';
import { RoomGateway } from './room/room.gateway';
import { ConfigModule } from '@nestjs/config';
import { RoomModule } from './room/room.module';
import { AuthMiddleWare } from './user/middlewares/auth.middleware';
import { QuizzModule } from './quizz/quizz.module';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';
import { GameService } from './game/game.service';

@Module({
  imports: [
    ServeStaticModule.forRoot({ rootPath: join(__dirname, '..', 'uploads') }),
    ConfigModule.forRoot({ isGlobal: true, envFilePath: '.env' }),
    TypeOrmModule.forRoot(db.options),
    UserModule,
    RoomModule,
    QuizzModule,
  ],
  controllers: [],
  providers: [GameService, RoomGateway],
})
export class AppModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(AuthMiddleWare).forRoutes({
      path: '*',
      method: RequestMethod.ALL,
    });
  }
}
