import { Module } from '@nestjs/common';
import { BooksController } from './books.controller';
import { BooksService } from './books.service';
import { JWTStrategy } from '../auth/strategy';
import { JwtModule } from '@nestjs/jwt';

@Module({
  controllers: [BooksController],
  providers: [BooksService, JWTStrategy],
  imports: [JwtModule.register({})],
})
export class BooksModule {}
