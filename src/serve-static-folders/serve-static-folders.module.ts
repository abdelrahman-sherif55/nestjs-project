import { Module } from '@nestjs/common';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';

@Module({
  imports: [
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', '..', 'uploads'),
      serveRoot: '/files',
      serveStaticOptions: {
        extensions: ['webp', 'png', 'jpg', 'jpeg'],
        index: false,
      },
    }),
  ],
})
export class ServeStaticFoldersModule {}
