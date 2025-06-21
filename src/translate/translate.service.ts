import { Injectable } from '@nestjs/common';
import { I18nContext, I18nService, TranslateOptions } from 'nestjs-i18n';

@Injectable()
export class TranslateService {
  constructor(private readonly i18n: I18nService) {}

  translate(key: string, options?: TranslateOptions) {
    const lang = I18nContext.current()?.lang;
    return this.i18n.t(key, options);
  }
}
