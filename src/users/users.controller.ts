import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  Query,
  Req,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { UsersService } from './users.service';
import { CreateUserDto } from './dtos/create-user.dto';
import { ParseMongoIdPipe } from '../common/pipes/parse-mongo-id.pipe';
import { UpdateUserDto } from './dtos/update-user.dto';
import { ChangeUserPasswordDto } from './dtos/change-user-password.dto';
import { CustomRequest } from '../common/interfaces/custom-request.interface';
import { createParseFilePipe } from '../common/upload-files/files-validation-factory';
import { Files } from '../common/types/file.types';
import { Roles } from '../common/decorators/roles.decorator';
import { Role } from '../common/enums/roles.enum';

@Controller('api/v1/users')
@Roles(Role.ADMIN)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  @HttpCode(HttpStatus.OK)
  async getAll(@Query() query: any) {
    return await this.usersService.getAll(query);
  }

  @Get(':id')
  @HttpCode(HttpStatus.OK)
  async getOne(@Param('id', ParseMongoIdPipe) id: string) {
    return await this.usersService.getOne(id);
  }

  @Post()
  @UseInterceptors(FileInterceptor('image'))
  @HttpCode(HttpStatus.CREATED)
  async createOne(
    @Body() data: CreateUserDto,
    @UploadedFile(createParseFilePipe('10MB', ['jpg', 'jpeg', 'png', 'webp']))
    image?: Files,
  ) {
    return await this.usersService.createOne(data, image);
  }

  @Patch(':id')
  @UseInterceptors(FileInterceptor('image'))
  @HttpCode(HttpStatus.OK)
  async updateOne(
    @Req() req: CustomRequest,
    @Param('id', ParseMongoIdPipe) id: string,
    @Body() data: UpdateUserDto,
    @UploadedFile(createParseFilePipe('10MB', ['jpg', 'jpeg', 'png', 'webp']))
    image?: Files,
  ) {
    return await this.usersService.updateOne(id, data, req.user!, image);
  }

  @Post(':id/change-password')
  @HttpCode(HttpStatus.OK)
  async changePassword(
    @Req() req: CustomRequest,
    @Param('id', ParseMongoIdPipe) id: string,
    @Body() data: ChangeUserPasswordDto,
  ) {
    return await this.usersService.changePassword(id, data, req.user!);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  async deleteOne(
    @Req() req: CustomRequest,
    @Param('id', ParseMongoIdPipe) id: string,
  ) {
    return await this.usersService.deleteOne(id, req.user!);
  }
}
