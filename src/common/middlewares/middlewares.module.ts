import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { MongoSanitizeMiddleware } from './mongo-sanitize.middleware';

@Module({})
export class MiddlewaresModule implements NestModule {
  configure(consumer: MiddlewareConsumer): any {
    consumer.apply(MongoSanitizeMiddleware).forRoutes('*');
  }
}
