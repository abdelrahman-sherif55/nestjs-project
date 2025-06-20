import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Query,
  UploadedFile,
  UploadedFiles,
  UseInterceptors,
} from '@nestjs/common';
import {
  FileFieldsInterceptor,
  FileInterceptor,
  FilesInterceptor,
} from '@nestjs/platform-express';
import { ExamplesService } from './examples.service';
import { CreateExampleDto } from './dtos/create-example.dto';
import { UpdateExampleDto } from './dtos/update-example.dto';
import { ParseMongoIdPipe } from '../common/pipes/parse-mongo-id.pipe';
import { createParseFilePipe } from '../common/upload-files/files-validation-factory';
import { MaxFileCount } from '../common/constants/file-count.constant';
import { Files } from '../common/types/file.types';
import { Roles } from '../common/decorators/roles.decorator';
import { Role } from '../common/enums/roles.enum';

@Controller('api/v1/examples')
@Roles(Role.ADMIN, Role.USER)
// @Public()
export class ExamplesController {
  constructor(private readonly examplesService: ExamplesService) {}

  @Get()
  @HttpCode(HttpStatus.OK)
  async getAll(@Query() query: any) {
    return await this.examplesService.getAll(query);
  }

  @Get('list')
  @HttpCode(HttpStatus.OK)
  async getAllList(@Query() query: any) {
    return await this.examplesService.getAllList(query);
  }

  @Get(':id')
  @HttpCode(HttpStatus.OK)
  async getOne(@Param('id', ParseMongoIdPipe) id: string) {
    return await this.examplesService.getOne(id);
  }

  @Post()
  @UseInterceptors(
    FileFieldsInterceptor([
      { name: 'cover', maxCount: MaxFileCount.EXAMPLE_COVER },
      { name: 'images', maxCount: MaxFileCount.EXAMPLE_IMAGES },
    ]),
  )
  @HttpCode(HttpStatus.CREATED)
  async createOne(
    @Body() data: CreateExampleDto,
    @UploadedFiles()
    files?: { cover?: Files[]; images?: Files[] },
  ) {
    const pipe = createParseFilePipe('10MB', ['jpg', 'jpeg', 'png', 'webp']);

    if (files?.cover?.length) {
      files.cover.forEach((file) => pipe.transform(file));
    }

    if (files?.images?.length) {
      files.images.forEach((file) => pipe.transform(file));
    }
    return await this.examplesService.createOne(data, files);
  }

  @Post(':id')
  @UseInterceptors(FileInterceptor('cover'))
  @HttpCode(HttpStatus.OK)
  async updateOne(
    @Param('id', ParseMongoIdPipe) id: string,
    @Body() data: UpdateExampleDto,
    @UploadedFile(createParseFilePipe('10MB', ['jpg', 'jpeg', 'png', 'webp']))
    cover?: Files,
  ) {
    return await this.examplesService.updateOne(id, data, cover);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  async deleteOne(@Param('id', ParseMongoIdPipe) id: string) {
    return await this.examplesService.deleteOne(id);
  }

  @Post(':id/images')
  @UseInterceptors(FilesInterceptor('images', MaxFileCount.EXAMPLE_IMAGES))
  @HttpCode(HttpStatus.OK)
  async addImages(
    @Param('id', ParseMongoIdPipe) id: string,
    @UploadedFiles(createParseFilePipe('10MB', ['jpg', 'jpeg', 'png', 'webp']))
    images: Files[],
  ) {
    return await this.examplesService.addImages(id, images);
  }

  @Delete(':id/images/:image')
  @HttpCode(HttpStatus.OK)
  async deleteImage(
    @Param('id', ParseMongoIdPipe) id: string,
    @Param('image') image: string,
  ) {
    return await this.examplesService.removeImage(id, image);
  }
}
