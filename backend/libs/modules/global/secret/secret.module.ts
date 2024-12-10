import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { SecretService } from './secret.service';

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: ['.env'],
    }),
  ],
  providers: [SecretService],
  exports: [SecretService],
})
export class SecretsModule {}
