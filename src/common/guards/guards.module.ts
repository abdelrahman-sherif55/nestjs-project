import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { CustomThrottlerGuard } from './custom-throttler.guard';
import { ProtectRoutesGuard } from './protect-routes.guard';
import { UsersModule } from '../../users/users.module';
import { RolesGuard } from './roles.guard';
import { ActiveGuard } from './active.guard';

@Module({
  imports: [UsersModule],
  providers: [
    { provide: APP_GUARD, useClass: CustomThrottlerGuard },
    { provide: APP_GUARD, useClass: ProtectRoutesGuard },
    { provide: APP_GUARD, useClass: RolesGuard },
    { provide: APP_GUARD, useClass: ActiveGuard },
  ],
})
export class GuardsModule {}
