import { OmitType, PartialType } from '@nestjs/mapped-types';
import { CreateUserDto } from './create-user.dto';
import { IsBoolean, IsOptional } from 'class-validator';

export class UpdateUserDto extends PartialType(
  OmitType(CreateUserDto, [
    'username',
    'email',
    'role',
    'password',
    'confirmPassword',
  ] as const),
) {
  @IsBoolean({ message: 'Invalid active value' })
  @IsOptional()
  active: boolean;
}
