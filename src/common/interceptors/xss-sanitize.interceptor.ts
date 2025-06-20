import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import * as xss from 'xss';

function sanitizeObject(obj: any, options: xss.IFilterXSSOptions = {}) {
  if (!obj) return;
  if (Array.isArray(obj)) {
    for (let i = 0; i < obj.length; i++) {
      if (typeof obj[i] === 'string') {
        obj[i] = xss.filterXSS(obj[i], options);
      } else if (typeof obj[i] === 'object' && obj[i] !== null) {
        sanitizeObject(obj[i], options);
      }
    }
  } else if (typeof obj === 'object') {
    for (const key in obj) {
      if (typeof obj[key] === 'string') {
        obj[key] = xss.filterXSS(obj[key], options);
      } else if (typeof obj[key] === 'object' && obj[key] !== null) {
        sanitizeObject(obj[key], options);
      }
    }
  }
}

function sanitizeHeaders(headers: any, options: xss.IFilterXSSOptions = {}) {
  const ignored = ['Authorization'];
  for (const key in headers) {
    if (ignored.includes(key.toLowerCase())) continue;

    if (typeof headers[key] === 'string') {
      headers[key] = xss.filterXSS(headers[key], options);
    } else if (typeof headers[key] === 'object' && headers[key] !== null) {
      sanitizeObject(headers[key], options);
    }
  }
}

@Injectable()
export class XssSanitizeInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();

    sanitizeObject(request.body);
    sanitizeObject(request.query);
    sanitizeObject(request.params);
    sanitizeHeaders(request.headers);
    return next.handle();
  }
}
