import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { Environment } from '../common/interfaces/environment.interface';

@Injectable()
export class CreateTokensService {
  constructor(
    private readonly configService: ConfigService<Environment>,
    private readonly jwtService: JwtService,
  ) {}

  public AccessToken(userId: any): string {
    return this.jwtService.sign(
      { id: userId },
      {
        secret: this.configService.get('ACCESS_SECRET_KEY', { infer: true }),
        expiresIn: this.configService.get('ACCESS_TIME', { infer: true }),
      },
    );
  }

  public RefreshToken(userId: any): string {
    return this.jwtService.sign(
      { id: userId },
      {
        secret: this.configService.get('REFRESH_SECRET_KEY', { infer: true }),
        expiresIn: this.configService.get('REFRESH_TIME', { infer: true }),
      },
    );
  }

  public ForgetPasswordToken(userId: any): string {
    return this.jwtService.sign(
      { id: userId },
      {
        secret: this.configService.get('RESET_SECRET_KEY', { infer: true }),
        expiresIn: this.configService.get('RESET_TIME', { infer: true }),
      },
    );
  }
}
