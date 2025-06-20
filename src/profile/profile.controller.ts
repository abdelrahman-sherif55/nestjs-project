import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Patch,
  Req,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ProfileService } from './profile.service';
import { CustomRequest } from '../common/interfaces/custom-request.interface';
import { Users } from '../users/users.schema';
import { UpdateProfileDto } from './dtos/update-profile.dto';
import { ChangeProfilePasswordDto } from './dtos/change-profile-password.dto';
import { createParseFilePipe } from '../common/upload-files/files-validation-factory';
import { Files } from '../common/types/file.types';

@Controller('api/v1/profile')
export class ProfileController {
  constructor(private readonly profileService: ProfileService) {}

  @Get()
  @HttpCode(HttpStatus.OK)
  getProfile(@Req() req: CustomRequest) {
    return this.profileService.getProfile(req.user as Users);
  }

  @Patch()
  @UseInterceptors(FileInterceptor('image'))
  @HttpCode(HttpStatus.OK)
  async updateProfile(
    @Req() req: CustomRequest,
    @Body() data: UpdateProfileDto,
    @UploadedFile(createParseFilePipe('10MB', ['jpg', 'jpeg', 'png', 'webp']))
    image?: Files,
  ) {
    return this.profileService.updateProfile(req.user!, data, image);
  }

  @Patch('change-password')
  @HttpCode(HttpStatus.OK)
  async changePassword(
    @Req() req: CustomRequest,
    @Body() data: ChangeProfilePasswordDto,
  ) {
    return this.profileService.changePassword(req.user!, data);
  }
}
