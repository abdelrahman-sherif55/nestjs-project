import { IsString, Length } from 'class-validator';
import { i18nValidationMessage } from 'nestjs-i18n';

export class VerifyCodeDto {
  @Length(6, 6, {
    message: i18nValidationMessage('auth-validation.RESET_CODE_INVALID'),
  })
  @IsString({
    message: i18nValidationMessage('auth-validation.RESET_CODE_REQUIRED'),
  })
  resetCode: string;
}
