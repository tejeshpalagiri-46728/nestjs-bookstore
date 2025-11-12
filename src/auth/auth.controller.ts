import {
  All,
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { ILogin, IRegister } from './validators/types';
import { Request } from 'express';
import { JwtGuard } from './guard';

@Controller('auth')
export class AuthController {
  constructor(private _authService: AuthService) {}

  @HttpCode(HttpStatus.OK)
  @Post('login')
  login(@Body() body: ILogin) {
    return this._authService.login(body);
  }

  @Post('register')
  register(@Body() body: IRegister) {
    return this._authService.register(body);
  }

  @UseGuards(JwtGuard)
  @Get('me')
  me(@Req() req: Request) {
    return this._authService.me(req.user?.['userId']);
  }
}
