import { IsEmail, IsNotEmpty } from 'class-validator';

export class IRegister {
  @IsNotEmpty()
  firstName: string;

  @IsNotEmpty()
  lastName: string;

  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsNotEmpty()
  password: string;
}

export class ILogin {
  @IsNotEmpty()
  email: string;

  @IsNotEmpty()
  password: string;
}
