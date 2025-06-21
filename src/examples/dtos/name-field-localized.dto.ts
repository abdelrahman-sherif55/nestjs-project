import { IsString, Length } from 'class-validator';
import { Transform } from 'class-transformer';
import { i18nValidationMessage } from 'nestjs-i18n';

export class NameFieldLocalizedDto {
  @Transform(({ value }) => {
    return value.toString().trim();
  })
  @Length(2, 20, {
    message: i18nValidationMessage('examples-validation.NAME_LENGTH'),
  })
  @IsString({ message: i18nValidationMessage('examples-validation.NAME_AR') })
  ar: string;

  @Transform(({ value }) => {
    return value.toString().trim();
  })
  @Length(2, 20, {
    message: i18nValidationMessage('examples-validation.NAME_LENGTH'),
  })
  @IsString({ message: i18nValidationMessage('examples-validation.NAME_EN') })
  en: string;
}
