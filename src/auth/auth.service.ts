import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  InternalServerErrorException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { ConfigService } from '@nestjs/config';
import { JsonWebTokenError, JwtService, TokenExpiredError } from '@nestjs/jwt';
import { Request } from 'express';
import { Model } from 'mongoose';
import crypto from 'crypto';
import * as bcrypt from 'bcrypt';
import { CreateTokensService } from './create-tokens.service';
import { SignupDto } from './dtos/signup.dto';
import { LoginDto } from './dtos/login.dto';
import { ForgetPasswordDto } from './dtos/forget-password.dto';
import { VerifyCodeDto } from './dtos/verify-code.dto';
import { ResetPasswordDto } from './dtos/reset-password.dto';
import { UserDocument, Users } from '../users/users.schema';
import { ResponseUserDto } from '../users/dtos/response-user.dto';
import { UsersService } from '../users/users.service';
import { MailService } from '../mail/mail.service';
import { Files } from '../common/types/file.types';
import { Role } from '../common/enums/roles.enum';
import { Environment } from '../common/interfaces/environment.interface';
import { TokensTime } from '../common/constants/tokens-time.constant';
import { SerializerService } from '../common/serializer.service';

@Injectable()
export class AuthService {
  constructor(
    @InjectModel(Users.name) private readonly usersModel: Model<Users>,
    private readonly usersService: UsersService,
    private readonly createTokensService: CreateTokensService,
    private readonly mailService: MailService,
    private readonly configService: ConfigService<Environment>,
    private readonly jwtService: JwtService,
    private readonly serializerService: SerializerService,
  ) {}

  public async signup(data: SignupDto, image?: Files) {
    if (data.password !== data.confirmPassword) {
      throw new BadRequestException('passwords do not match');
    }
    const existingUser: Users | null = await this.usersModel.findOne({
      $or: [{ username: data.username }, { email: data.email }],
    });
    if (existingUser) {
      throw new BadRequestException('Username or email already exists');
    }
    if (image) data.image = await this.usersService.refactorImage(image);
    const user: UserDocument = await this.usersModel.create(data);
    const sanitizedUser: UserDocument = this.serializerService.sanitize(user);
    const accessToken: string = this.createTokensService.AccessToken(
      sanitizedUser._id,
    );
    const refreshToken: string = this.createTokensService.RefreshToken(
      sanitizedUser._id,
    );
    return {
      accessToken,
      refreshToken,
      data: new ResponseUserDto(sanitizedUser as Users),
    };
  }

  public async login(data: LoginDto) {
    const user: UserDocument | null = await this.usersModel.findOne({
      $or: [{ username: data.username }, { email: data.username }],
    });
    const sanitizedUser: UserDocument = this.serializerService.sanitize(user);
    const tokens = await this.checkLoggedUser(data, sanitizedUser);
    return {
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
      data: new ResponseUserDto(sanitizedUser as Users),
    };
  }

  public async loginAdmin(data: LoginDto) {
    const user: UserDocument | null = await this.usersModel.findOne({
      $or: [{ username: data.username }, { email: data.username }],
      role: { $in: [Role.ADMIN] },
    });
    const sanitizedUser: UserDocument = this.serializerService.sanitize(user);
    const tokens = await this.checkLoggedUser(data, sanitizedUser);
    return {
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
      data: new ResponseUserDto(sanitizedUser as Users),
    };
  }

  private async checkLoggedUser(data: LoginDto, user?: UserDocument) {
    if (!user || !(await bcrypt.compare(data.password, user.password))) {
      throw new BadRequestException('Invalid username or password');
    }
    const accessToken: string = this.createTokensService.AccessToken(user._id);
    const refreshToken: string = this.createTokensService.RefreshToken(
      user._id,
    );
    return { accessToken, refreshToken };
  }

  public async forgetPassword(data: ForgetPasswordDto) {
    const user: UserDocument | null = await this.usersModel.findOne({
      email: data.email,
    });
    if (!user) {
      throw new BadRequestException('Invalid email');
    }
    const resetCode: string = Math.floor(
      100000 + Math.random() * 900000,
    ).toString();
    user.passwordResetCode = crypto
      .createHash('sha256')
      .update(resetCode)
      .digest('hex');
    user.passwordResetCodeExpires = new Date(Date.now() + 30 * 60 * 1000);
    user.passwordResetCodeVerify = false;

    try {
      await this.mailService.sendMail(user.email, 'Reset Password', resetCode);
      await user.save({ validateModifiedOnly: true });
    } catch (err) {
      console.log(err);
      throw new InternalServerErrorException('try again later');
    }
    const token: string = this.createTokensService.ForgetPasswordToken(
      user._id,
    );
    return { message: 'check your email', resetToken: token };
  }

  public async verifyCode(decodedToken: any, data: VerifyCodeDto) {
    const hashedResetCode: string = crypto
      .createHash('sha256')
      .update(data.resetCode)
      .digest('hex');
    const user: UserDocument | null = await this.usersModel.findOne({
      _id: decodedToken.id,
      passwordResetCode: hashedResetCode,
      passwordResetCodeExpires: { $gt: Date.now() },
    });
    if (!user) {
      throw new BadRequestException('invalid or expired code');
    }
    user.passwordResetCodeVerify = true;
    await user.save({ validateModifiedOnly: true });
    return { message: 'code verified' };
  }

  public async resetPassword(decodedToken: any, data: ResetPasswordDto) {
    if (data.password !== data.confirmPassword)
      throw new BadRequestException('passwords do not match');
    const user: any = await this.usersModel.findOne({
      _id: decodedToken.id,
      passwordResetCodeVerify: true,
    });
    if (!user) throw new ForbiddenException("you can't change password");
    user.password = data.password;
    user.passwordResetCode = undefined;
    user.passwordResetCodeExpires = undefined;
    user.passwordResetCodeVerify = undefined;
    user.passwordChangedAt = new Date(Date.now());
    await user.save({ validateModifiedOnly: true });
    return { message: 'password changed successfully' };
  }

  public async refreshToken(req: Request) {
    let refreshToken: string = '';
    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith('Refresh')
    ) {
      refreshToken = req.headers.authorization.split(' ')[1];
    } else {
      throw new UnauthorizedException('Session expired, please log in again');
    }

    let decodedToken: any;
    try {
      decodedToken = this.jwtService.verify(refreshToken, {
        secret: this.configService.get('REFRESH_SECRET_KEY', { infer: true }),
      });
    } catch (error) {
      if (
        error instanceof TokenExpiredError ||
        error instanceof JsonWebTokenError
      ) {
        throw new UnauthorizedException('Session expired, please log in again');
      }
    }

    if (decodedToken.exp - decodedToken.iat !== TokensTime.REFRESH_TOKEN) {
      throw new UnauthorizedException('Session expired, please log in again');
    }
    const accessToken: string = this.createTokensService.AccessToken(
      decodedToken.id,
    );
    return { accessToken };
  }
}
