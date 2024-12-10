import { Module } from "@nestjs/common";
import { HealthController } from "./health.controller";
import { HealthService } from "./health.service";
import { TerminusModule } from "@nestjs/terminus";
import { CacheModule } from "@libs/modules/cache/cache.module";
import { RedisHealthModule } from "@liaoliaots/nestjs-redis-health";

@Module({
  imports: [
    TerminusModule.forRoot({ errorLogStyle: "pretty" }),
    CacheModule,
    RedisHealthModule,
  ],

  controllers: [HealthController],
  providers: [HealthService],
})
export class HealthModule {}
