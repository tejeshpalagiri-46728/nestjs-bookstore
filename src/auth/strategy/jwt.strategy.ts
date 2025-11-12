import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';

@Injectable()
export class JWTStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor(_configService: ConfigService) {
    const JWT_SECRET = _configService.get<string>('JWT_SECRET');
    if (!JWT_SECRET) {
      throw new Error('JWT_SECRET is not defined in configuration');
    }
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: JWT_SECRET,
    });
  }

  validate(payload: Record<string, any>) {
    return payload;
  }
}
