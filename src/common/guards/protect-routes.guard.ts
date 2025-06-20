import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';
import { JsonWebTokenError, JwtService, TokenExpiredError } from '@nestjs/jwt';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Environment } from '../interfaces/environment.interface';
import { UserDocument, Users } from '../../users/users.schema';
import { IS_PUBLIC_KEY } from '../constants/keys.constant';
import { CustomRequest } from '../interfaces/custom-request.interface';
import { TokensTime } from '../constants/tokens-time.constant';
import { SerializerService } from '../serializer.service';

@Injectable()
export class ProtectRoutesGuard implements CanActivate {
  constructor(
    private readonly configService: ConfigService<Environment>,
    private readonly jwtService: JwtService,
    private readonly reflector: Reflector,
    private readonly serializerService: SerializerService,
    @InjectModel(Users.name) private readonly usersModel: Model<Users>,
  ) {}

  async canActivate(context: ExecutionContext) {
    const isPublic: boolean = this.reflector.getAllAndOverride<boolean>(
      IS_PUBLIC_KEY,
      [context.getHandler(), context.getClass()],
    );
    if (isPublic) return true;

    const request: CustomRequest = context
      .switchToHttp()
      .getRequest<CustomRequest>();

    let token: string = '';
    if (
      request.headers.authorization &&
      request.headers.authorization.startsWith('Bearer')
    ) {
      token = request.headers.authorization.split(' ')[1];
    } else {
      throw new UnauthorizedException('Please log in to continue');
    }
    let decodedToken: any;
    try {
      decodedToken = this.jwtService.verify(token, {
        secret: this.configService.get('ACCESS_SECRET_KEY', { infer: true }),
      });
    } catch (error) {
      if (
        error instanceof TokenExpiredError ||
        error instanceof JsonWebTokenError
      ) {
        throw new UnauthorizedException('Session expired, please log in again');
      }
    }
    if (decodedToken.exp - decodedToken.iat !== TokensTime.ACCESS_TOKEN) {
      throw new UnauthorizedException(
        'Session time mismatch, please log in again',
      );
    }
    const user: UserDocument | null = await this.usersModel.findById(
      decodedToken.id,
    );
    if (!user) {
      throw new UnauthorizedException('User does not exist anymore');
    }
    if (user.passwordChangedAt) {
      const changedPasswordTime: number = Math.trunc(
        user.passwordChangedAt.getTime() / 1000,
      );
      if (changedPasswordTime > decodedToken.iat) {
        throw new UnauthorizedException(
          'Password changed, please log in again',
        );
      }
    }
    request.user = this.serializerService.sanitize(user);

    return true;
  }
}
