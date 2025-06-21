import { IsString, Length } from 'class-validator';
import { i18nValidationMessage } from 'nestjs-i18n';

export class ResetPasswordDto {
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
    message: i18nValidationMessage('auth-validation.CONFIRM_PASSWORD_REQUIRED'),
  })
  confirmPassword: string;
}
