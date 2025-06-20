import { OmitType, PartialType } from '@nestjs/mapped-types';
import { CreateUserDto } from '../../users/dtos/create-user.dto';

export class UpdateProfileDto extends PartialType(
  OmitType(CreateUserDto, [
    'username',
    'email',
    'role',
    'password',
    'confirmPassword',
  ] as const),
) {}
