import { Injectable } from '@nestjs/common';

@Injectable()
export class SerializerService {
  public sanitize(doc: any) {
    return JSON.parse(JSON.stringify(doc));
  }
}
