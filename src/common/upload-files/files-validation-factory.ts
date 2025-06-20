import {
  FileTypeValidator,
  HttpStatus,
  MaxFileSizeValidator,
  ParseFilePipe,
  PayloadTooLargeException,
} from '@nestjs/common';
import { extname } from 'path';
import * as fs from 'fs';
import * as bytes from 'bytes';
import { FileValidator } from '@nestjs/common/pipes/file/file-validator.interface';
import { Files, FileSizeType, FileType } from '../types/file.types';
import { createFileTypeRegex } from '../utils/create-file-type-regex.util';
import { NonEmptyArray } from '../utils/array.util';
import { FileSignatureValidator } from './validators/file-signature.validator';

const createFileValidators = (
  maxSize: FileSizeType,
  fileTypes: NonEmptyArray<FileType>,
): FileValidator[] => {
  const fileTypeRegex = createFileTypeRegex(fileTypes);
  return [
    new MaxFileSizeValidator({
      maxSize: bytes(maxSize)!,
      message: (maxSize) =>
        `File is too big. Max file size is ${maxSize / 1024 / 1024} MB.`,
    }),
    new FileTypeValidator({
      fileType: fileTypeRegex,
    }),
    new FileSignatureValidator(),
  ];
};

export const createParseFilePipe = (
  maxSize: FileSizeType,
  fileTypes: NonEmptyArray<FileType>,
): ParseFilePipe =>
  new ParseFilePipe({
    validators: createFileValidators(maxSize, fileTypes),
    errorHttpStatusCode: HttpStatus.PAYLOAD_TOO_LARGE,
    exceptionFactory: (error: string) => {
      throw new PayloadTooLargeException(error);
    },
    fileIsRequired: false,
  });

export const generateFileName = (file: Files, path: string): string => {
  const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
  const ext = extname(file.originalname);
  ensureFolderExists(path);
  fs.writeFileSync(
    `${path}/${file.fieldname}-${uniqueSuffix}${ext}`,
    file.buffer,
  );
  return `${file.fieldname}-${uniqueSuffix}${ext}`;
};
export const ensureFolderExists = (folderPath: string) => {
  if (!fs.existsSync(folderPath)) {
    fs.mkdirSync(folderPath, { recursive: true });
  }
};

export const deleteFile = (filePath: string): void => {
  if (fs.existsSync(filePath)) {
    fs.unlink(filePath, (err) => {
      if (err) console.error(`Error deleting file: ${err}`);
      else console.log(`File deleted successfully: ${filePath}`);
    });
  } else {
    console.log(`File not found: ${filePath}`);
  }
};
