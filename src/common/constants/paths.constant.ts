export const FolderPath = {
  USERS: 'uploads/images/users',
  EXAMPLES: 'uploads/images/examples',
} as const satisfies Record<string, string>;

export const FilePath = {
  USERS: 'files/images/users',
  EXAMPLES: 'files/images/examples',
} as const satisfies Record<string, string>;
