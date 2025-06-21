import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
  RequestTimeoutException,
} from '@nestjs/common';
import {
  catchError,
  Observable,
  throwError,
  timeout,
  TimeoutError,
} from 'rxjs';
import { TranslateService } from '../../translate/translate.service';

@Injectable()
export class TimeoutInterceptor implements NestInterceptor {
  constructor(private readonly i18n: TranslateService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    return next.handle().pipe(
      timeout(60000),
      catchError((err) => {
        if (err instanceof TimeoutError)
          return throwError(
            () =>
              new RequestTimeoutException(
                this.i18n.translate('auth-service.TRY_AGAIN'),
              ),
          );
        return throwError(() => err);
      }),
    );
  }
}
