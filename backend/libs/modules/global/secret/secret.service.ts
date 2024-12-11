import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class SecretService extends ConfigService {
  constructor() {
    super();
  }

  mongodb = {
    uri: this.get('MONGO_URI'),
  };

  application = {
    NODE_ENV: this.get<string>('NODE_ENV'),
    PORT: this.get<number>('PORT'),
    ENABLE_DOCS: ['1', 1, 'yes', 'true'].includes(
      this.get<string>('ENABLE_DOCS'),
    ),
  };

  authentication = {
    secret: this.get('AUTH_SECRET_KEY'),
    accessExpireTime: +this.get<number>('AUTH_ACCESS_EXP_TIME'),
    refreshExpireTime: +this.get<number>('AUTH_REFRESH_EXP_TIME'),
  };

  redis = {
    host: this.get<string>('REDIS_HOST'),
    port: +this.get<number>('REDIS_PORT'),
    db: +this.get<number>('REDIS_DB') || 0,
    username: this.get<string>('REDIS_USERNAME'),
    password: this.get<string>('REDIS_PASSWORD'),
  };

  google = {
    clientId: this.getOrThrow('GOOGLE_CLIENT_ID'),
    clientSecret: this.getOrThrow('GOOGLE_CLIENT_SECRET'),
  };
}
