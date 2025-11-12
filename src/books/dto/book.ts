import { IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';

export class ICreateBook {
  @IsNotEmpty()
  @IsString()
  title: string;

  @IsString()
  description?: string;

  @IsNotEmpty()
  @IsNumber()
  quantity: number;

  created_by: string;
}

export class IEditBook {
  @IsOptional()
  @IsString()
  title: string;

  @IsOptional()
  @IsString()
  description: string;

  @IsOptional()
  @IsNumber()
  quantity: number;
}
