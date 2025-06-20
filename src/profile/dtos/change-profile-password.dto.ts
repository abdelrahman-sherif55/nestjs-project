import { IntersectionType, OmitType } from '@nestjs/mapped-types';
import { CreateUserDto } from '../../users/dtos/create-user.dto';
import { IsString, Length } from 'class-validator';

export class ChangeProfilePasswordDto extends IntersectionType(
  OmitType(CreateUserDto, [
    'username',
    'email',
    'role',
    'name',
    'image',
  ] as const),
) {
  @Length(6, 20, { message: 'current password length between 6,20' })
  @IsString({ message: 'current password required' })
  currentPassword: string;
}
