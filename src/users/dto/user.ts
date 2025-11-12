import { UserStatus } from '@prisma/client';
import { IsEnum, IsOptional } from 'class-validator';

export class UserEditDto {
  @IsOptional()
  first_name?: string;

  @IsOptional()
  last_name?: string;

  @IsOptional()
  @IsEnum(UserStatus)
  status: UserStatus;
}
