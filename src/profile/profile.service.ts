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
import { TranslateService } from '../translate/translate.service';

@Injectable()
export class ProfileService {
  constructor(
    @InjectModel(Users.name) private readonly usersModel: Model<Users>,
    private readonly usersService: UsersService,
    private readonly createTokensService: CreateTokensService,
    private readonly serializerService: SerializerService,
    private readonly i18n: TranslateService,
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
      message: this.i18n.translate('profile-service.UPDATED_PROFILE'),
      data: new ResponseProfileDto(sanitizedProfile),
    };
  }

  public async changePassword(
    user: UserDocument,
    data: ChangeProfilePasswordDto,
  ) {
    if (!(await bcrypt.compare(data.currentPassword, user.password))) {
      throw new BadRequestException(
        this.i18n.translate('profile-service.INCORRECT_CURRENT_PASSWORD'),
      );
    }
    if (data.password !== data.confirmPassword) {
      throw new BadRequestException(
        this.i18n.translate('profile-service.PASSWORDS_DO_NOT_MATCH'),
      );
    }
    if (data.password === data.currentPassword) {
      throw new BadRequestException(
        this.i18n.translate('profile-service.SAME_CURRENT_NEW_PASSWORD'),
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
      message: this.i18n.translate('profile-service.PASSWORD_CHANGED'),
      accessToken,
      data: new ResponseProfileDto(sanitizedProfile as Users),
    };
  }
}
