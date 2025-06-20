import { Injectable, NestMiddleware } from '@nestjs/common';
import { NextFunction, Request, Response } from 'express';

@Injectable()
export class MongoSanitizeMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    this.sanitize(req.body);
    this.sanitize(req.query);
    this.sanitize(req.params);
    next();
  }

  private sanitize(obj: any) {
    if (typeof obj !== 'object' || obj === null) return;

    for (const key in obj) {
      if (Object.prototype.hasOwnProperty.call(obj, key)) {
        if (key.startsWith('$') || key.includes('.')) {
          delete obj[key];
        } else {
          this.sanitize(obj[key]);
        }
      }
    }
  }
}
