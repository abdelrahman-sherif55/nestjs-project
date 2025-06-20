import { Exclude, Expose, Transform } from 'class-transformer';
import { Role } from '../../common/enums/roles.enum';
import { FilePath } from '../../common/constants/paths.constant';

export class ResponseProfileDto {
  @Expose({ name: 'id' })
  _id: string;

  username: string;

  email: string;

  name: string;

  @Transform(({ value }) => {
    const baseUrl = process.env.BASE_URL;
    return value && value.startsWith('user')
      ? `${baseUrl}/${FilePath.USERS}/${value}`
      : value;
  })
  image: string;

  active: boolean;

  role: Role;

  @Exclude()
  password: string;

  @Exclude()
  passwordChangedAt: Date;

  @Exclude()
  passwordResetCode: string;

  @Exclude()
  passwordResetCodeExpires: Date;

  @Exclude()
  passwordResetCodeVerify: boolean;

  @Exclude()
  createdAt: Date;

  @Exclude()
  updatedAt: Date;

  @Exclude()
  __v: number;

  constructor(partial: Partial<ResponseProfileDto>) {
    Object.assign(this, partial);
  }
}
