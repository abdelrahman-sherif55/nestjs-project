import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as bcrypt from 'bcrypt';
import { UserDocument, Users } from '../users/users.schema';
import { ResponseProfileDto } from './dtos/response-profile.dto';
import { UpdateProfileDto } from './dtos/update-profile.dto';
import { ChangeProfilePasswordDto } from './dtos/change-profile-password.dto';
import { Files } from '../common/types/file.types';
import { UsersService } from '../users/users.service';
import { CreateTokensService } from '../auth/create-tokens.service';
import { SerializerService } from '../common/serializer.service';

@Injectable()
export class ProfileService {
  constructor(
    @InjectModel(Users.name) private readonly usersModel: Model<Users>,
    private readonly usersService: UsersService,
    private readonly createTokensService: CreateTokensService,
    private readonly serializerService: SerializerService,
  ) {}

  public getProfile(user: Users) {
    return { data: new ResponseProfileDto(user) };
  }

  public async updateProfile(
    user: UserDocument,
    data: UpdateProfileDto,
    image?: Files,
  ) {
    if (image) {
      data.image = await this.usersService.refactorImage(image);
      this.usersService.deleteOldImage(user);
    }
    const profile: Users | null = await this.usersModel.findByIdAndUpdate(
      user._id,
      data,
      {
        new: true,
      },
    );
    const sanitizedProfile: Users = this.serializerService.sanitize(profile);
    return {
      message: 'Profile updated successfully',
      data: new ResponseProfileDto(sanitizedProfile),
    };
  }

  public async changePassword(
    user: UserDocument,
    data: ChangeProfilePasswordDto,
  ) {
    if (!(await bcrypt.compare(data.currentPassword, user.password))) {
      throw new BadRequestException('Current password is incorrect');
    }
    if (data.password !== data.confirmPassword) {
      throw new BadRequestException('New passwords do not match');
    }
    if (data.password === data.currentPassword) {
      throw new BadRequestException(
        'New password cannot be the same as the old one',
      );
    }
    const profile: Users | null = await this.usersModel.findByIdAndUpdate(
      user._id,
      {
        password: await bcrypt.hash(data.password, 15),
        passwordChangedAt: Date.now(),
      },
    );
    const sanitizedProfile: UserDocument =
      this.serializerService.sanitize(profile);
    const accessToken: string = this.createTokensService.AccessToken(
      sanitizedProfile._id,
    );
    return {
      message: 'Password changed successfully',
      accessToken,
      data: new ResponseProfileDto(sanitizedProfile as Users),
    };
  }
}
