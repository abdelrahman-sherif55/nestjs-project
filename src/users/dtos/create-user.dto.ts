import {
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  Length,
} from 'class-validator';
import { Role } from '../../common/enums/roles.enum';
import { i18nValidationMessage } from 'nestjs-i18n';

export class CreateUserDto {
  @Length(2, 20, {
    message: i18nValidationMessage('users-validation.USERNAME_LENGTH'),
  })
  @IsString({
    message: i18nValidationMessage('users-validation.USERNAME_REQUIRED'),
  })
  username: string;

  @IsEmail(
    {},
    { message: i18nValidationMessage('users-validation.EMAIL_INVALID') },
  )
  @IsNotEmpty({
    message: i18nValidationMessage('users-validation.EMAIL_REQUIRED'),
  })
  email: string;

  @Length(2, 20, {
    message: i18nValidationMessage('users-validation.NAME_LENGTH'),
  })
  @IsString({
    message: i18nValidationMessage('users-validation.NAME_REQUIRED'),
  })
  name: string;

  @IsString({
    message: i18nValidationMessage('users-validation.IMAGE_INVALID'),
  })
  @IsOptional()
  image: string;

  @IsEnum(Role, {
    message: i18nValidationMessage('users-validation.ROLE_INVALID'),
  })
  @IsOptional()
  role: Role;

  @Length(6, 20, {
    message: 'i18nValidationMessage.users-validation.PASSWORD_LENGTH',
  })
  @IsString({
    message: i18nValidationMessage('users-validation.PASSWORD_REQUIRED'),
  })
  password: string;

  @Length(6, 20, {
    message: 'i18nValidationMessage.users-validation.CONFIRM_PASSWORD_LENGTH',
  })
  @IsString({
    message: 'i18nValidationMessage.users-validation.CONFIRM_PASSWORD_REQUIRED',
  })
  confirmPassword: string;
}
