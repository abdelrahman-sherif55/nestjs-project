import { IsEmail, IsOptional, IsString, Length } from 'class-validator';
import { i18nValidationMessage } from 'nestjs-i18n';

export class SignupDto {
  @Length(2, 20, {
    message: i18nValidationMessage('auth-validation.USERNAME_LENGTH'),
  })
  @IsString({
    message: i18nValidationMessage('auth-validation.USERNAME_REQUIRED'),
  })
  username: string;

  @IsEmail(
    {},
    { message: i18nValidationMessage('auth-validation.EMAIL_INVALID') },
  )
  @IsString({
    message: i18nValidationMessage('auth-validation.EMAIL_REQUIRED'),
  })
  email: string;

  @Length(2, 20, {
    message: i18nValidationMessage('auth-validation.NAME_LENGTH'),
  })
  @IsString({
    message: i18nValidationMessage('auth-validation.NAME_REQUIRED'),
  })
  name: string;

  @IsString({
    message: i18nValidationMessage('auth-validation.IMAGE_INVALID'),
  })
  @IsOptional()
  image: string;

  @Length(6, 20, {
    message: i18nValidationMessage('auth-validation.PASSWORD_LENGTH'),
  })
  @IsString({
    message: i18nValidationMessage('auth-validation.PASSWORD_REQUIRED'),
  })
  password: string;

  @Length(6, 20, {
    message: i18nValidationMessage('auth-validation.CONFIRM_PASSWORD_LENGTH'),
  })
  @IsString({
    message: i18nValidationMessage(
      'auth-validation.CONFIRM_PASSWORD_REQUIRED ',
    ),
  })
  confirmPassword: string;
}
