export const FoldersSizePath = {
  UPLOADS: 'uploads',
} as const satisfies Record<string, string>;

export const FoldersSizeGB = {
  UPLOADS: 5,
} as const satisfies Record<string, number>;
