import { Module } from '@nestjs/common';
import { ThrottlerModule } from '@nestjs/throttler';

@Module({
  imports: [
    ThrottlerModule.forRoot({
      throttlers: [
        {
          name: 'short',
          ttl: 3000,
          limit: 3,
        },
        {
          name: 'medium',
          ttl: 10000,
          limit: 10,
        },
        {
          name: 'long',
          ttl: 60000,
          limit: 30,
        },
      ],
    }),
  ],
})
export class ThrottlerRateLimitModule {}
