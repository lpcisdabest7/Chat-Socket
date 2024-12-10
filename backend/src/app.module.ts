import { Module } from '@nestjs/common';
import { GlobalModule } from '@libs/modules/global/global.module';
import { MongoDBModule } from '@libs/modules/database/mongodb/mongodb.module';
import { CommandModule } from 'nestjs-command';
import { HealthModule } from './health/health.module';
import { AuthModule } from './auth/auth.module';
import { AuthGoogleModule } from './auth-google/auth-google.module';

@Module({
  imports: [
    GlobalModule,
    HealthModule,
    MongoDBModule,
    CommandModule,
    AuthModule,
    AuthGoogleModule,
  ],
})
export class AppModule {}
