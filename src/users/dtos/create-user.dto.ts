import {
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  Length,
} from 'class-validator';
import { Role } from '../../common/enums/roles.enum';

export class CreateUserDto {
  @Length(2, 20, { message: 'username length between 2,20' })
  @IsString({ message: 'username required' })
  username: string;

  @IsEmail({}, { message: 'Invalid Email' })
  @IsNotEmpty({ message: 'Email required' })
  email: string;

  @Length(2, 20, { message: 'name length between 2,20' })
  @IsString({ message: 'name required' })
  name: string;

  @IsString({ message: 'Invalid image' })
  @IsOptional()
  image: string;

  @IsEnum(Role, { message: 'Invalid role' })
  @IsOptional()
  role: Role;

  @Length(6, 20, { message: 'password length between 6,20' })
  @IsString({ message: 'password required' })
  password: string;

  @Length(6, 20, { message: 'confirm password length between 6,20' })
  @IsString({ message: 'confirm password required' })
  confirmPassword: string;
}
