export type Files = Express.Multer.File;
export type FileType = 'png' | 'jpg' | 'jpeg' | 'webp';
export type FileSizeType = `${number}${'KB' | 'MB' | 'GB' | 'TB'}`;
export const DefaultImageType = '.webp';
