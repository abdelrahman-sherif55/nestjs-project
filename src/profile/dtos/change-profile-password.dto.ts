import { IntersectionType, OmitType } from '@nestjs/mapped-types';
import { CreateUserDto } from '../../users/dtos/create-user.dto';
import { IsString, Length } from 'class-validator';
import { i18nValidationMessage } from 'nestjs-i18n';

export class ChangeProfilePasswordDto extends IntersectionType(
  OmitType(CreateUserDto, [
    'username',
    'email',
    'role',
    'name',
    'image',
  ] as const),
) {
  @Length(6, 20, {
    message: i18nValidationMessage(
      'profile-validation.CURRENT_PASSWORD_LENGTH',
    ),
  })
  @IsString({
    message: i18nValidationMessage(
      'profile-validation.CURRENT_PASSWORD_REQUIRED',
    ),
  })
  currentPassword: string;
}
