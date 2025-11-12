import { Injectable } from '@nestjs/common';
import { UserStatus } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { UserEditDto } from './dto/user';

@Injectable()
export class UsersService {
  constructor(private _prismaService: PrismaService) {}

  getAllUsers(status: UserStatus = UserStatus.ACTIVE) {
    return this._prismaService.user.findMany({
      where: {
        status: status,
      },
    });
  }

  updateUser(userId: string, dto: UserEditDto) {
    return this._prismaService.user.updateManyAndReturn({
      where: {
        id: userId,
      },
      data: {
        first_name: dto.first_name,
        last_name: dto.last_name,
        status: dto.status,
      },
      omit: {
        hash: true,
      },
    });
  }
}
