import {
  IsString,
  IsEmail,
  IsStrongPassword,
  Length,
  IsOptional,
  IsDateString,
  IsEnum,
  //IsNumber,
} from 'class-validator';
import { Role } from 'src/enums/role.enum';

export class CreateUserDTO {
  //@IsNumber()
  id: number;

  @IsString()
  @Length(3)
  name: string;

  @IsEmail()
  email: string;

  @IsStrongPassword({
    minLength: 6,
    minLowercase: 0,
    minUppercase: 0,
    minNumbers: 0,
    minSymbols: 0,
  })
  password: string;

  @IsOptional()
  @IsDateString()
  birthAt: Date;

  @IsOptional()
  @IsEnum(Role)
  role: number;
}
