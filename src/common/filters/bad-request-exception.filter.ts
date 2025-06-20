import {
  ArgumentsHost,
  BadRequestException,
  Catch,
  ExceptionFilter,
} from '@nestjs/common';
import { Response } from 'express';

@Catch(BadRequestException)
export class BadRequestExceptionFilter<T> implements ExceptionFilter {
  catch(exception: BadRequestException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response: Response = ctx.getResponse<Response>();

    const status: number = exception.getStatus();
    const exceptionResponse = exception.getResponse();

    let message: string;

    if (
      typeof exceptionResponse === 'object' &&
      exceptionResponse !== null &&
      'message' in exceptionResponse
    ) {
      const res: any = exceptionResponse;
      message = Array.isArray(res.message) ? res.message[0] : res.message;
    } else if (typeof exceptionResponse === 'string') {
      message = exceptionResponse;
    } else {
      message = 'Something went wrong';
    }

    response.status(status).json({
      statusCode: status,
      message,
      error: 'Bad Request',
    });
  }
}
