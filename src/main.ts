import { NestFactory } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';
import { NestExpressApplication } from '@nestjs/platform-express';
import { I18nValidationPipe } from 'nestjs-i18n';
import { json } from 'express';
import helmet from 'helmet';
import * as hpp from 'hpp';
import * as cookieParser from 'cookie-parser';
import * as csrf from 'csurf';
import * as compression from 'compression';
import { AppModule } from './app.module';
import { Environment } from './common/interfaces/environment.interface';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  const configService: ConfigService<Environment> = app.get(ConfigService);
  app.set('trust proxy', true);
  app.enableCors({
    origin: ['http://localhost:3000'],
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Authorization', 'Content-Type'],
    credentials: true,
  });
  app.useGlobalPipes(
    new I18nValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );
  app.use(json({ limit: '5kb' }));
  app.use(cookieParser());
  app.use(csrf({ cookie: { secure: true, sameSite: 'strict' } }));
  app.use(compression());
  app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }));
  app.use(hpp({ whitelist: [] }));
  const port: number = configService.get('PORT', { infer: true }) || 3000;
  await app.listen(port);
}

bootstrap();
