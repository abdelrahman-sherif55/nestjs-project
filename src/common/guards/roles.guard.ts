import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Environment } from '../interfaces/environment.interface';
import { Users } from '../../users/users.schema';
import { Role } from '../enums/roles.enum';
import { ROLES_KEY } from '../constants/keys.constant';
import { CustomRequest } from '../interfaces/custom-request.interface';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(
    private readonly configService: ConfigService<Environment>,
    private readonly jwtService: JwtService,
    private readonly reflector: Reflector,
    @InjectModel(Users.name) private readonly usersModel: Model<Users>,
  ) {}

  canActivate(context: ExecutionContext) {
    const roles: Role[] = this.reflector.getAllAndOverride<Role[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (!roles) return true;
    const { user } = context.switchToHttp().getRequest<CustomRequest>();
    if (!roles.includes(user!.role)) {
      throw new ForbiddenException(
        'You do not have permission to access this resource.',
      );
    }
    return true;
  }
}
