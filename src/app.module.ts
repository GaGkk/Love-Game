import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import db from './orm.config';
import { UserModule } from './tables/user/user.module';

@Module({
  imports: [
    TypeOrmModule.forRoot(db.options),
    UserModule
  ],
  controllers: [],
  providers: [],
})
export class AppModule { }
