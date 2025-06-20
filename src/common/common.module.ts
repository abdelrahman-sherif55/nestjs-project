import { Global, Module } from '@nestjs/common';
import { GenerateCode } from './classes/generate-code';
import { ExceptionFiltersModule } from './filters/exception-filters.module';
import { InterceptorsModule } from './interceptors/interceptors.module';
import { MiddlewaresModule } from './middlewares/middlewares.module';
import { GuardsModule } from './guards/guards.module';
import { SerializerService } from './serializer.service';

@Global()
@Module({
  imports: [
    MiddlewaresModule,
    GuardsModule,
    InterceptorsModule,
    ExceptionFiltersModule,
  ],
  providers: [GenerateCode, SerializerService],
  exports: [GenerateCode, SerializerService],
})
export class CommonModule {}
