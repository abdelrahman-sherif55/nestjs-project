import { IsString, Length } from 'class-validator';

export class VerifyCodeDto {
  @Length(6, 6, { message: 'invalid code' })
  @IsString({ message: 'reset code required' })
  resetCode: string;
}
