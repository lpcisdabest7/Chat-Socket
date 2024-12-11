import { Module } from '@nestjs/common';
import { RedisModule } from '@liaoliaots/nestjs-redis';
import { SecretService } from '../global/secret/secret.service';

@Module({
  imports: [
    RedisModule.forRootAsync({
      useFactory: (secretService: SecretService) => ({
        errorLog: true,
        config: {
          host: secretService.redis.host,
          port: secretService.redis.port,
          db: secretService.redis.db,
          username: secretService.redis.username,
          password: secretService.redis.password,
        },
      }),
      inject: [SecretService],
    }),
  ],
})
export class CacheModule {}
