import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import { Role } from '../common/enums/roles.enum';

@Schema({ timestamps: true })
export class Users {
  @Prop()
  username: string;

  @Prop()
  email: string;

  @Prop()
  name: string;

  @Prop()
  image: string;

  @Prop({ default: true })
  active: boolean;

  @Prop()
  password: string;

  @Prop({ enum: [Role.ADMIN, Role.USER], default: Role.USER })
  role: Role;

  @Prop()
  passwordChangedAt: Date;

  @Prop()
  passwordResetCode: string;

  @Prop()
  passwordResetCodeExpires: Date;

  @Prop()
  passwordResetCodeVerify: boolean;
}

export type UserDocument = HydratedDocument<Users>;
export const UsersSchema = SchemaFactory.createForClass(Users);
