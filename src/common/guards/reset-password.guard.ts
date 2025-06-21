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
import { TranslateService } from '../../translate/translate.service';

@Injectable()
export class ResetPasswordGuard implements CanActivate {
  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService<Environment>,
    private readonly i18n: TranslateService,
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
      throw new ForbiddenException(
        this.i18n.translate('auth-service.CAN_NOT_RESET_PASSWORD'),
      );
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
        throw new ForbiddenException(
          this.i18n.translate('auth-service.CAN_NOT_RESET_PASSWORD'),
        );
      }
    }
    if (
      decodedToken.exp - decodedToken.iat !==
      TokensTime.RESET_PASSWORD_TOKEN
    ) {
      throw new ForbiddenException(
        this.i18n.translate('auth-service.CAN_NOT_RESET_PASSWORD'),
      );
    }
    request.decodedToken = decodedToken;
    return true;
  }
}
