import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JsonWebTokenError, JwtService, TokenExpiredError } from '@nestjs/jwt';
import { CustomRequest } from '../interfaces/custom-request.interface';
import { Environment } from '../interfaces/environment.interface';
import { TokensTime } from '../constants/tokens-time.constant';

@Injectable()
export class ResetPasswordGuard implements CanActivate {
  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService<Environment>,
  ) {}

  canActivate(context: ExecutionContext) {
    const request: CustomRequest = context
      .switchToHttp()
      .getRequest<CustomRequest>();
    let resetToken: string = '';
    if (
      request.headers.authorization &&
      request.headers.authorization.startsWith('Bearer')
    ) {
      resetToken = request.headers.authorization.split(' ')[1];
    } else {
      throw new ForbiddenException("You can't change the password");
    }
    let decodedToken: any;
    try {
      decodedToken = this.jwtService.verify(resetToken, {
        secret: this.configService.get('RESET_SECRET_KEY', { infer: true }),
      });
    } catch (error) {
      if (
        error instanceof TokenExpiredError ||
        error instanceof JsonWebTokenError
      ) {
        throw new ForbiddenException("You can't change the password");
      }
    }
    if (
      decodedToken.exp - decodedToken.iat !==
      TokensTime.RESET_PASSWORD_TOKEN
    ) {
      throw new ForbiddenException("You can't change the password");
    }
    request.decodedToken = decodedToken;
    return true;
  }
}
