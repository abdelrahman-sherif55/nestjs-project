import {
  Injectable,
  NestMiddleware,
  PayloadTooLargeException,
} from '@nestjs/common';
import { NextFunction, Request, Response } from 'express';
import * as fs from 'fs/promises';
import { getFolderSize } from '../utils/get-folder-size.util';
import { TranslateService } from '../../translate/translate.service';

interface FolderSizeOptions {
  folderPath: string;
  maxSizeGB: number;
}

@Injectable()
export class CheckFolderSizeMiddleware implements NestMiddleware {
  constructor(
    private readonly options: FolderSizeOptions,
    private readonly i18n: TranslateService,
  ) {}

  async use(req: Request, res: Response, next: NextFunction) {
    try {
      if (req.file || req.files) {
        const { folderPath, maxSizeGB } = this.options;
        await fs.mkdir(folderPath, { recursive: true });
        const maxSizeBytes: number = maxSizeGB * 1024 * 1024 * 1024;
        const folderSize = await getFolderSize(folderPath);

        if ((folderSize as number) >= maxSizeBytes) {
          throw new PayloadTooLargeException(
            this.i18n.translate('common.MAX_SIZE', { args: { maxSizeGB } }),
          );
        }
        next();
      }
    } catch (err) {
      next(err);
    }
  }
}

export const checkFolderSizeProvider = (
  options: FolderSizeOptions,
  i18n: TranslateService,
) => {
  return new CheckFolderSizeMiddleware(options, i18n);
};
