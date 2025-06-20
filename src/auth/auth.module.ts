import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { UsersModule } from '../users/users.module';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { CreateTokensService } from './create-tokens.service';

@Module({
  imports: [JwtModule.register({ global: true }), UsersModule],
  controllers: [AuthController],
  providers: [AuthService, CreateTokensService],
  exports: [CreateTokensService],
})
export class AuthModule {}
