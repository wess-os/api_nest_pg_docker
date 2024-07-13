import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { User } from './users/users.entity';
import { Place } from './places/places.entity';
import { PlacesController } from './places/places.controller';
import { PlacesService } from './places/places.service';
import { AuthController } from './auth/auth.controller';
import { AuthService } from './auth/auth.service';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: process.env.DB_TYPE as any,
      host: process.env.PG_HOST,
      port: parseInt(process.env.PG_PORT),
      username: process.env.PG_USER,
      password: process.env.PG_PASSWORD,
      database: process.env.PG_DB,
      entities: [User, Place],
      synchronize: true,
    }),
    TypeOrmModule.forFeature([User, Place]),
  ],
  controllers: [AppController, PlacesController, AuthController],
  providers: [AppService, PlacesService, AuthService],
})
export class AppModule {}
