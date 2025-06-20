import { Controller, Get, Req } from '@nestjs/common';
import { Request } from 'express';
import { Public } from './common/decorators/public.decorator';

@Controller('api/v1')
@Public()
export class AppController {
  @Get('csrf-token')
  getHello(@Req() req: Request) {
    return { csrfToken: req.csrfToken() };
  }
}
