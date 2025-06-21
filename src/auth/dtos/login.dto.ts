import { IsString, Length } from 'class-validator';
import { i18nValidationMessage } from 'nestjs-i18n';

export class LoginDto {
  @IsString({
    message: i18nValidationMessage('auth-validation.USERNAME_LOGIN_REQUIRED'),
  })
  username: string;

  @Length(6, 20, {
    message: i18nValidationMessage('auth-validation.PASSWORD_LENGTH'),
  })
  @IsString({
    message: i18nValidationMessage('auth-validation.PASSWORD_REQUIRED'),
  })
  password: string;
}
