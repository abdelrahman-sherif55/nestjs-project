import { Module } from '@nestjs/common';
import { APP_FILTER } from '@nestjs/core';
import { BadRequestExceptionFilter } from './bad-request-exception.filter';

@Module({
  providers: [{ provide: APP_FILTER, useClass: BadRequestExceptionFilter }],
})
export class ExceptionFiltersModule {}
