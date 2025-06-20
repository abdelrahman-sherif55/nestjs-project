import { Module } from '@nestjs/common';
import { CommonModule } from './common/common.module';
import { ConfigurationModule } from './configuration/configuration.module';
import { ServeStaticFoldersModule } from './serve-static-folders/serve-static-folders.module';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { ProfileModule } from './profile/profile.module';
import { ExamplesModule } from './examples/examples.module';
import { MongoModule } from './mongo/mongo.module';
import { MailModule } from './mail/mail.module';
import { ThrottlerRateLimitModule } from './throttler-rate-limit/throttler-rate-limit.module';
import { AppController } from './app.controller';

@Module({
  imports: [
    ConfigurationModule,
    ServeStaticFoldersModule,
    ThrottlerRateLimitModule,
    MongoModule,
    CommonModule,
    MailModule,
    AuthModule,
    UsersModule,
    ProfileModule,
    ExamplesModule,
  ],
  controllers: [AppController],
  providers: [],
})
export class AppModule {}
