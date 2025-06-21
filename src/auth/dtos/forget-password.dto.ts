import { IsEmail, IsString } from 'class-validator';
import { i18nValidationMessage } from 'nestjs-i18n';

export class ForgetPasswordDto {
  @IsEmail(
    {},
    { message: i18nValidationMessage('auth-validation.EMAIL_INVALID') },
  )
  @IsString({
    message: i18nValidationMessage('auth-validation.EMAIL_REQUIRED'),
  })
  email: string;
}
