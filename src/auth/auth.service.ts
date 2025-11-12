import {
  UnauthorizedException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ILogin, IRegister } from './validators/types';
import * as argon from 'argon2';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AuthService {
  constructor(
    private _prismaService: PrismaService,
    private _jwtService: JwtService,
    private _configService: ConfigService,
  ) {}

  async login(data: ILogin) {
    try {
      const user = await this.getUserByEmail(data.email, {});
      if (!user) {
        throw new NotFoundException('Incorrect credentials provided');
      }
      const isUserLegit = await argon.verify(user.hash, data.password);
      if (!isUserLegit) {
        throw new UnauthorizedException('Incorrect credentials provided');
      }
      const sessionToken = await this.signToken(user.id, user.email);
      return {
        success: true,
        data: user,
        token: sessionToken,
      };
    } catch (error) {
      throw error;
    }
  }

  async register(data: IRegister) {
    try {
      const userExists = await this.getUserByEmail(data.email);
      if (userExists) {
        throw new ForbiddenException(
          'User with the given email already exists',
        );
      }
      const user = {
        first_name: data.firstName,
        last_name: data.lastName,
        email: data.email,
        hash: await argon.hash(data.password),
      };

      const savedUser = await this._prismaService.user.create({
        data: user,
        omit: {
          hash: true,
        },
      });
      return {
        success: true,
        message: 'Registered Successfully',
        user: savedUser,
      };
    } catch (error) {
      throw error;
    }
  }

  async me(userId: string) {
    const user = await this.getUserById(userId, { hash: true });
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return {
      success: true,
      data: user,
    };
  }

  async getUserById(userId: string, omit: any = { hash: true }) {
    return this._prismaService.user.findUnique({
      where: {
        id: userId,
      },
      omit: { ...omit },
    });
  }

  async getUserByEmail(email: string, omit: any = { hash: true }) {
    return await this._prismaService.user.findUnique({
      where: {
        email: email,
      },
      omit: { ...omit },
    });
  }

  async signToken(userId: string, email: string): Promise<string> {
    return this._jwtService.signAsync(
      {
        userId,
        email,
      },
      {
        secret: this._configService.get('JWT_SECRET'),
        expiresIn: this._configService.get('JWT_EXPIRY'),
      },
    );
  }

  async verifyToken(token: string) {
    return this._jwtService.verify(token);
  }
}
