import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { CustomRequest } from '../interfaces/custom-request.interface';
import { IS_PUBLIC_KEY } from '../constants/keys.constant';
import { Reflector } from '@nestjs/core';

@Injectable()
export class ActiveGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext) {
    const isPublic: boolean = this.reflector.getAllAndOverride<boolean>(
      IS_PUBLIC_KEY,
      [context.getHandler(), context.getClass()],
    );
    if (isPublic) return true;

    const { user } = context.switchToHttp().getRequest<CustomRequest>();
    if (!user?.active) {
      throw new ForbiddenException('Your account is not active.');
    }
    return true;
  }
}
