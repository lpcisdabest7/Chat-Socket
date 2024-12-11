import { Global, Module } from '@nestjs/common';
import { LoggerModule } from './logger/logger.module';
import { SecretsModule } from './secret/secret.module';
import { ClsModule } from 'nestjs-cls';

@Global()
@Module({
  imports: [
    LoggerModule,
    SecretsModule,
    ClsModule.forRoot({
      global: true,
      middleware: {
        mount: true,
      },
    }),
  ],
  exports: [LoggerModule, SecretsModule],
})
export class GlobalModule {}
