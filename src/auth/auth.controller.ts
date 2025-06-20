import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Patch,
  Post,
  Req,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { Throttle } from '@nestjs/throttler';
import { Request } from 'express';
import { AuthService } from './auth.service';
import { SignupDto } from './dtos/signup.dto';
import { LoginDto } from './dtos/login.dto';
import { ForgetPasswordDto } from './dtos/forget-password.dto';
import { VerifyCodeDto } from './dtos/verify-code.dto';
import { ResetPasswordDto } from './dtos/reset-password.dto';
import { createParseFilePipe } from '../common/upload-files/files-validation-factory';
import { Files } from '../common/types/file.types';
import { Public } from '../common/decorators/public.decorator';
import { CustomRequest } from '../common/interfaces/custom-request.interface';
import { ResetPasswordGuard } from '../common/guards/reset-password.guard';

@Controller('api/v1/auth')
@Public()
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('signup')
  @UseInterceptors(FileInterceptor('image'))
  @HttpCode(HttpStatus.CREATED)
  async signup(
    @Body() data: SignupDto,
    @UploadedFile(createParseFilePipe('10MB', ['jpg', 'jpeg', 'png', 'webp']))
    image?: Files,
  ) {
    return await this.authService.signup(data, image);
  }

  @Post('login')
  @Throttle({ default: { limit: 5, ttl: 900000 } })
  @HttpCode(HttpStatus.OK)
  async login(data: LoginDto) {
    return await this.authService.login(data);
  }

  @Post('login-admin')
  @HttpCode(HttpStatus.OK)
  async loginAdmin(data: LoginDto) {
    return await this.authService.loginAdmin(data);
  }

  @Post('refresh-token')
  @HttpCode(HttpStatus.OK)
  async refreshToken(@Req() req: Request) {
    return await this.authService.refreshToken(req);
  }

  @Post('forget-password')
  @HttpCode(HttpStatus.OK)
  async forgetPassword(@Body() data: ForgetPasswordDto) {
    return await this.authService.forgetPassword(data);
  }

  @Post('verify-code')
  @UseGuards(ResetPasswordGuard)
  @HttpCode(HttpStatus.OK)
  async verifyCode(@Req() req: CustomRequest, @Body() data: VerifyCodeDto) {
    return await this.authService.verifyCode(req.decodedToken, data);
  }

  @Patch('reset-password')
  @UseGuards(ResetPasswordGuard)
  @HttpCode(HttpStatus.OK)
  async resetPassword(
    @Req() req: CustomRequest,
    @Body() data: ResetPasswordDto,
  ) {
    return await this.authService.resetPassword(req.decodedToken, data);
  }
}
