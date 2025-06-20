import { IsString, Length } from 'class-validator';

export class LoginDto {
  @IsString({ message: 'username or email required' })
  username: string;

  @Length(6, 20, { message: 'password length between 6,20' })
  @IsString({ message: 'password required' })
  password: string;
}
