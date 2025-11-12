import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { JwtModule } from '@nestjs/jwt';
import { JWTStrategy } from '../auth/strategy';
import { AuthService } from '../auth/auth.service';

@Module({
  providers: [UsersService, JWTStrategy, AuthService],
  controllers: [UsersController],
  imports: [JwtModule.register({})],
})
export class UsersModule {}
