import { Injectable, UnprocessableEntityException } from '@nestjs/common';
import { Model } from 'mongoose';
import * as crypto from 'crypto';

@Injectable()
export class GenerateCode {
  private readonly MAX_ATTEMPTS = 10;
  private readonly BATCH_SIZE = 10;
  private readonly CODE_LENGTH = 8;
  private readonly BASE32_ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';

  private generateCode(length: number): string {
    let code: string = '';
    const bytes = crypto.randomBytes(length);
    for (let i = 0; i < length; i++) {
      code += this.BASE32_ALPHABET[bytes[i] % this.BASE32_ALPHABET.length];
    }
    return code;
  }

  public async generateUniqueCode<ModelType>(Model: Model<ModelType>) {
    for (let attempt = 0; attempt < this.MAX_ATTEMPTS; attempt++) {
      const codes = new Set();
      while (codes.size < this.BATCH_SIZE) {
        codes.add(this.generateCode(this.CODE_LENGTH));
      }

      const codesArray = Array.from(codes);

      const existingCodes = new Set(
        (await Model.find({ code: { $in: codesArray } }, 'code')).map(
          (doc: any) => doc.code,
        ),
      );

      for (const code of codesArray) if (!existingCodes.has(code)) return code;
    }
    throw new UnprocessableEntityException('برجاء المحاولة مرة أخرى لاحقاً');
  }
}
