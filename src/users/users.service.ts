import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as bcrypt from 'bcrypt';
import * as sharp from 'sharp';
import { v4 as uuidV4 } from 'uuid';
import { Crud } from '../common/classes/crud';
import { UserDocument, Users } from './users.schema';
import { CreateUserDto } from './dtos/create-user.dto';
import { ResponseUserDto } from './dtos/response-user.dto';
import { UpdateUserDto } from './dtos/update-user.dto';
import { ChangeUserPasswordDto } from './dtos/change-user-password.dto';
import { DefaultImageType, Files } from '../common/types/file.types';
import { FolderPath } from '../common/constants/paths.constant';
import {
  deleteFile,
  ensureFolderExists,
} from '../common/upload-files/files-validation-factory';
import { SerializerService } from '../common/serializer.service';

@Injectable()
export class UsersService {
  private crud: Crud<Users>;

  constructor(
    @InjectModel(Users.name) private readonly usersModel: Model<Users>,
    private readonly serializerService: SerializerService,
  ) {
    this.crud = new Crud<Users>(usersModel, Users.name);
  }

  public async getAll(query: any) {
    const data = await this.crud.getAll(query, {});
    const serializedData: Users[] = this.serializerService.sanitize(data.data);
    return {
      ...data,
      data: serializedData.map((user: Users) => new ResponseUserDto(user)),
    };
  }

  public async getOne(id: string) {
    const user: Users | null = await this.crud.getOne(id);
    if (!user) {
      throw new BadRequestException('user not found');
    }
    const serializedUser: Users = this.serializerService.sanitize(user);
    return { data: new ResponseUserDto(serializedUser) };
  }

  public async createOne(data: CreateUserDto, image?: Files) {
    if (data.password !== data.confirmPassword) {
      throw new BadRequestException('Passwords do not match');
    }
    const existingUser: Users | null = await this.usersModel.findOne({
      $or: [{ username: data.username }, { email: data.email }],
    });
    if (existingUser) {
      throw new BadRequestException('Username or email already exists');
    }
    if (image) data.image = await this.refactorImage(image);
    const user: Users = await this.crud.createOne(data);
    const serializedUser: Users = this.serializerService.sanitize(user);
    return {
      message: 'user created successfully',
      data: new ResponseUserDto(serializedUser),
    };
  }

  public async updateOne(
    id: string,
    data: UpdateUserDto,
    loggedUser: UserDocument,
    image?: Files,
  ) {
    this.checkLoggedInUser(id, loggedUser);
    if (image) {
      data.image = await this.refactorImage(image);
      const userData: Users | null = await this.crud.getOne(id);
      if (userData) this.deleteOldImage(userData);
    }
    const user: Users | null = await this.crud.updateOne(id, data);
    if (!user) {
      if (image) deleteFile(`${FolderPath.USERS}/${data.image}`);
      throw new BadRequestException('user not found');
    }
    const serializedUser: Users = this.serializerService.sanitize(user);
    return {
      message: 'user updated successfully',
      data: new ResponseUserDto(serializedUser),
    };
  }

  public async changePassword(
    id: string,
    data: ChangeUserPasswordDto,
    loggedUser: UserDocument,
  ) {
    this.checkLoggedInUser(id, loggedUser);
    if (data.password !== data.confirmPassword) {
      throw new BadRequestException('Passwords do not match');
    }
    const user: Users | null = await this.usersModel.findByIdAndUpdate(
      id,
      {
        password: await bcrypt.hash(data.password, 15),
        passwordChangedAt: Date.now(),
      },
      { new: true },
    );
    if (!user) {
      throw new BadRequestException('user not found');
    }
    const serializedUser: Users = this.serializerService.sanitize(user);
    return {
      message: 'Password changed successfully',
      data: new ResponseUserDto(serializedUser),
    };
  }

  public async deleteOne(id: string, loggedUser: UserDocument) {
    this.checkLoggedInUser(id, loggedUser);
    const user: Users | null = await this.crud.deleteOne(id);
    if (!user) {
      throw new BadRequestException('user not found');
    }
    const serializedUser: Users = this.serializerService.sanitize(user);
    this.deleteOldImage(serializedUser);
    return { message: 'User deleted successfully' };
  }

  public async refactorImage(image: Files) {
    const folderPath = FolderPath.USERS;
    ensureFolderExists(folderPath);
    const fileName = `user-${uuidV4()}-DRAM${DefaultImageType}`;
    await sharp(image.buffer)
      .toFormat('webp')
      .webp({ quality: 95 })
      .toFile(`${folderPath}/${fileName}`);
    return fileName;
  }

  public deleteOldImage(user: Users) {
    if (user.image && user.image.startsWith('user')) {
      const imagePath = `${FolderPath.USERS}/${user.image}`;
      ensureFolderExists(FolderPath.USERS);
      deleteFile(imagePath);
    }
  }

  private checkLoggedInUser(id: string, loggedUser: UserDocument) {
    if (id === loggedUser._id.toString()) {
      throw new BadRequestException(
        'You cannot perform this action on yourself',
      );
    }
  }
}
