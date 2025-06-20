import { IsString, Length } from 'class-validator';

export class ResetPasswordDto {
  @Length(6, 20, { message: 'password length between 6,20' })
  @IsString({ message: 'password required' })
  password: string;

  @Length(6, 20, { message: 'password length between 6,20' })
  @IsString({ message: 'confirm password required' })
  confirmPassword: string;
}
