import { OmitType, PartialType } from '@nestjs/mapped-types';
import { CreateUserDto } from './create-user.dto';
import { IsBoolean, IsOptional } from 'class-validator';
import { i18nValidationMessage } from 'nestjs-i18n';

export class UpdateUserDto extends PartialType(
  OmitType(CreateUserDto, [
    'username',
    'email',
    'role',
    'password',
    'confirmPassword',
  ] as const),
) {
  @IsBoolean({
    message: i18nValidationMessage('users-validation.ACTIVE_INVALID'),
  })
  @IsOptional()
  active: boolean;
}
