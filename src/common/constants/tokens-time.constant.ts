export const TokensTime = {
  ACCESS_TOKEN: 86400, // 24 hours in seconds
  REFRESH_TOKEN: 2592000, // 30 days in seconds
  RESET_PASSWORD_TOKEN: 1800, // 30 minutes in seconds
} as const satisfies Record<string, number>;
