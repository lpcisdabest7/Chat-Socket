import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bull';
import { SecretService } from '../global/secret/secret.service';

@Module({
  imports: [
    BullModule.forRootAsync({
      useFactory: (secretService: SecretService) => ({
        redis: {
          host: secretService.redis.host,
          port: secretService.redis.port,
          username: secretService.redis.username,
          password: secretService.redis.password,
          db: secretService.redis.db,
        },
        prefix: 'apero',
      }),
      inject: [SecretService],
    }),
  ],
})
export class QueueModule {}
