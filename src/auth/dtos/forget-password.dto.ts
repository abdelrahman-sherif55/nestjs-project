import { IsEmail, IsString } from 'class-validator';

export class ForgetPasswordDto {
  @IsEmail({}, { message: 'Invalid email' })
  @IsString({ message: 'email required' })
  email: string;
}
