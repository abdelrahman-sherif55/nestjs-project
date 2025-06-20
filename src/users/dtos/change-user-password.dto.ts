import { IntersectionType, OmitType } from '@nestjs/mapped-types';
import { CreateUserDto } from './create-user.dto';

export class ChangeUserPasswordDto extends IntersectionType(
  OmitType(CreateUserDto, [
    'username',
    'email',
    'role',
    'name',
    'image',
  ] as const),
) {}
