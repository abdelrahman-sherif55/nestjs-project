import { Module } from '@nestjs/common';
import { APP_FILTER } from '@nestjs/core';
import { I18nValidationExceptionFilter } from 'nestjs-i18n';

@Module({
  providers: [
    {
      provide: APP_FILTER,
      useFactory: () =>
        new I18nValidationExceptionFilter({ detailedErrors: false }),
    },
  ],
})
export class ExceptionFiltersModule {}
