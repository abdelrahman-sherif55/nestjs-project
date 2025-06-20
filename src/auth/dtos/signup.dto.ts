import { IsEmail, IsOptional, IsString, Length } from 'class-validator';

export class SignupDto {
  @Length(2, 20, { message: 'username length between 2,20' })
  @IsString({ message: 'username required' })
  username: string;

  @IsEmail({}, { message: 'Invalid email' })
  @IsString({ message: 'Email required' })
  email: string;

  @Length(2, 20, { message: 'name length between 2,20' })
  @IsString({ message: 'name required' })
  name: string;

  @IsString({ message: 'Invalid image' })
  @IsOptional()
  image: string;

  @Length(6, 20, { message: 'password length between 6,20' })
  @IsString({ message: 'password required' })
  password: string;

  @Length(6, 20, { message: 'password length between 6,20' })
  @IsString({ message: 'confirm password required' })
  confirmPassword: string;
}
