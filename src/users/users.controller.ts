import { Body, Controller, Get, Param, Patch, UseGuards } from '@nestjs/common';
import { UsersService } from './users.service';
import { JwtGuard } from '../auth/guard';
import { AuthService } from '../auth/auth.service';
import { UserEditDto } from './dto/user';

@UseGuards(JwtGuard)
@Controller('users')
export class UsersController {
  constructor(
    private _userService: UsersService,
    private _authService: AuthService,
  ) {}

  @Get()
  async getAllUsers() {
    const data = await this._userService.getAllUsers();
    return {
      success: true,
      data,
    };
  }

  @Get(':id')
  async getUserById(@Param() params: { id: string }) {
    const user = await this._authService.getUserById(params.id);
    return {
      success: true,
      data: user,
    };
  }

  @Patch(':id')
  async updatedUserStatus(
    @Body() body: UserEditDto,
    @Param() params: { id: string },
  ) {
    const updatedUser = await this._userService.updateUser(params.id, body);
    return {
      success: true,
      data: updatedUser,
    };
  }
}
