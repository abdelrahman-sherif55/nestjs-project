import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Crud } from '../common/classes/crud';
import { Examples } from './examples.schema';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { ResponseExampleDto } from './dtos/response-example.dto';
import { CreateExampleDto } from './dtos/create-example.dto';
import { DefaultImageType, Files } from '../common/types/file.types';
import { FolderPath } from '../common/constants/paths.constant';
import {
  deleteFile,
  ensureFolderExists,
} from '../common/upload-files/files-validation-factory';
import { v4 as uuidV4 } from 'uuid';
import * as sharp from 'sharp';
import { UpdateExampleDto } from './dtos/update-example.dto';
import { MaxFileCount } from '../common/constants/file-count.constant';
import { SerializerService } from '../common/serializer.service';
import { TranslateService } from '../translate/translate.service';
import { I18nContext } from 'nestjs-i18n';

@Injectable()
export class ExamplesService {
  private crud: Crud<Examples>;

  constructor(
    @InjectModel(Examples.name) private readonly examplesModel: Model<Examples>,
    private readonly serializerService: SerializerService,
    private readonly i18n: TranslateService,
  ) {
    this.crud = new Crud<Examples>(examplesModel, Examples.name);
  }

  public async getAll(query: any) {
    const data = await this.crud.getAll(query, {});
    const localizedData =
      this.examplesModel.schema.methods.toObjectLocalizedOnly(
        data.data,
        I18nContext.current()?.lang,
      );
    const sanitizedData: Examples[] =
      this.serializerService.sanitize(localizedData);
    return {
      ...data,
      data: sanitizedData.map(
        (example: Examples) => new ResponseExampleDto(example),
      ),
    };
  }

  public async getAllList(query: any) {
    const data = await this.crud.getAllList(query, {});
    const localizedData =
      this.examplesModel.schema.methods.toObjectLocalizedOnly(
        data.data,
        I18nContext.current()?.lang,
      );
    const sanitizedData: Examples[] =
      this.serializerService.sanitize(localizedData);
    return {
      ...data,
      data: sanitizedData.map(
        (example: Examples) => new ResponseExampleDto(example),
      ),
    };
  }

  public async getOne(id: string) {
    const example: Examples | null = await this.crud.getOne(id);
    if (!example) {
      throw new NotFoundException(
        this.i18n.translate('examples-service.NOT_FOUND'),
      );
    }
    const localizedExample =
      this.examplesModel.schema.methods.toObjectLocalizedOnly(
        example,
        I18nContext.current()?.lang,
      );
    const sanitizedExample: Examples =
      this.serializerService.sanitize(localizedExample);
    return { data: new ResponseExampleDto(sanitizedExample) };
  }

  public async createOne(
    data: CreateExampleDto,
    files?: { cover?: Files[]; images?: Files[] },
  ) {
    if (files) {
      if (files.cover && files.cover.length > 0) {
        data.cover = await this.refactorCover(files.cover[0]);
      }
      if (files.images && files.images.length > 0) {
        data.images = await this.refactorImages(files.images);
      }
    }
    const example: Examples = await this.crud.createOne(data);
    const sanitizedExample: Examples = this.serializerService.sanitize(example);
    return {
      message: this.i18n.translate('examples-service.CREATED'),
      data: new ResponseExampleDto(sanitizedExample),
    };
  }

  public async updateOne(id: string, data: UpdateExampleDto, cover?: Files) {
    if (cover) {
      data.cover = await this.refactorCover(cover);
      const exampleData: Examples | null = await this.crud.getOne(id);
      if (exampleData && exampleData.cover) {
        this.deleteOldImage(exampleData.cover);
      }
    }
    const example: Examples | null = await this.crud.updateOne(id, data);
    if (!example) {
      throw new NotFoundException(
        this.i18n.translate('examples-service.NOT_FOUND'),
      );
    }
    const sanitizedExample: Examples = this.serializerService.sanitize(example);
    return {
      message: this.i18n.translate('examples-service.UPDATED'),
      data: new ResponseExampleDto(sanitizedExample),
    };
  }

  public async deleteOne(id: string) {
    const example: Examples | null = await this.crud.deleteOne(id);
    if (!example) {
      throw new NotFoundException(
        this.i18n.translate('examples-service.NOT_FOUND'),
      );
    }
    const sanitizedExample: Examples = this.serializerService.sanitize(example);
    if (sanitizedExample.cover) this.deleteOldImage(sanitizedExample.cover);
    if (sanitizedExample.images) {
      sanitizedExample.images.forEach((image: string) =>
        this.deleteOldImage(image),
      );
    }
    return { message: this.i18n.translate('examples-service.DELETED') };
  }

  public async addImages(id: string, images: Files[]) {
    let example: Examples | null = await this.crud.getOne(id);
    if (!example) {
      throw new NotFoundException(
        this.i18n.translate('examples-service.NOT_FOUND'),
      );
    }
    let sanitizedExample: Examples = this.serializerService.sanitize(example);
    if (
      sanitizedExample.images.length + images.length >
      MaxFileCount.EXAMPLE_IMAGES
    ) {
      throw new BadRequestException(
        this.i18n.translate('examples-service.FAILED_UPLOAD_IMAGES', {
          args: {
            MAX_IMAGES: MaxFileCount.EXAMPLE_IMAGES,
            ADDED_IMAGES: sanitizedExample.images.length,
            WANTED_IMAGES:
              MaxFileCount.EXAMPLE_IMAGES - sanitizedExample.images.length,
          },
        }),
      );
    }
    const fileNames: string[] = await this.refactorImages(images);
    example = await this.crud.addImages(id, fileNames);
    sanitizedExample = this.serializerService.sanitize(example);
    return {
      message: this.i18n.translate('examples-service.IMAGES_ADDED'),
      data: new ResponseExampleDto(sanitizedExample),
    };
  }

  public async removeImage(id: string, image: string) {
    const example: Examples | null = await this.crud.removeImage(id, image);
    if (!example) {
      throw new NotFoundException(
        this.i18n.translate('examples-service.NOT_FOUND'),
      );
    }
    const sanitizedExample: Examples = this.serializerService.sanitize(example);
    this.deleteOldImage(image);
    return {
      message: this.i18n.translate('examples-service.IMAGE_REMOVED'),
      data: new ResponseExampleDto(sanitizedExample),
    };
  }

  private async refactorCover(cover: Files) {
    const folderPath = FolderPath.EXAMPLES;
    ensureFolderExists(folderPath);
    const fileName = `example:cover-${uuidV4()}-DRAM${DefaultImageType}`;
    await sharp(cover.buffer)
      .toFormat('webp')
      .webp({ quality: 95 })
      .toFile(`${folderPath}/${fileName}`);
    return fileName;
  }

  private async refactorImages(images: Files[]) {
    const folderPath = FolderPath.EXAMPLES;
    ensureFolderExists(folderPath);
    const fileNames: string[] = [];
    await Promise.all(
      images.map(async (image: Files, index: number) => {
        const fileName = `example:image${index + 1}-${uuidV4()}-DRAM${DefaultImageType}`;
        await sharp(image.buffer)
          .toFormat('webp')
          .webp({ quality: 95 })
          .toFile(`${folderPath}/${fileName}`);
        fileNames.push(fileName);
      }),
    );
    return fileNames;
  }

  private deleteOldImage(image: string) {
    if (image && image.startsWith('example')) {
      const imagePath = `${FolderPath.EXAMPLES}/${image}`;
      ensureFolderExists(FolderPath.EXAMPLES);
      deleteFile(imagePath);
    }
  }
}
