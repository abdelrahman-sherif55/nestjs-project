import {
  IsArray,
  IsDefined,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';
import { i18nValidationMessage } from 'nestjs-i18n';
import { NameFieldLocalizedDto } from './name-field-localized.dto';
import { Type } from 'class-transformer';

export class CreateExampleDto {
  @IsDefined({ message: i18nValidationMessage('examples-validation.NAME') })
  @Type(() => NameFieldLocalizedDto)
  @ValidateNested()
  name: NameFieldLocalizedDto;

  @IsString({ message: i18nValidationMessage('examples-validation.COVER') })
  @IsOptional()
  cover: string;

  @IsString({
    each: true,
    message: i18nValidationMessage('examples-validation.IMAGE'),
  })
  @IsArray({ message: i18nValidationMessage('examples-validation.IMAGES') })
  @IsOptional()
  images: string[];
}
