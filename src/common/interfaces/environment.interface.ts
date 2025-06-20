export interface Environment {
  PORT: number;
  BASE_URL: string;
  DB_URI: string;
  ACCESS_SECRET_KEY: string;
  ACCESS_TIME: string;
  REFRESH_SECRET_KEY: string;
  REFRESH_TIME: string;
  RESET_SECRET_KEY: string;
  RESET_TIME: string;
  EMAIL_HOST: string;
  EMAIL_PORT: number;
  EMAIL_SECURE: boolean;
  EMAIL_USERNAME: string;
  EMAIL_PASSWORD: string;
  APP_NAME: string;
}
