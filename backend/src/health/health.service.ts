import { Injectable } from "@nestjs/common";
import { HealthCheckService, MongooseHealthIndicator } from "@nestjs/terminus";
import { RedisHealthIndicator } from "@liaoliaots/nestjs-redis-health";
import { InjectRedis } from "@liaoliaots/nestjs-redis";
import Redis from "ioredis";

@Injectable()
export class HealthService {
  constructor(
    private readonly mongodb: MongooseHealthIndicator,
    private readonly redis: RedisHealthIndicator,
    private readonly health: HealthCheckService,
    @InjectRedis() private readonly redisClient: Redis
  ) {}
  async checkHealth() {
    return await this.health.check([
      () => this.mongodb.pingCheck("mongodb", { timeout: 10000 }),
      () =>
        this.redis.checkHealth("redis", {
          type: "redis",
          client: this.redisClient,
          timeout: 10000,
        }),
    ]);
  }
}
