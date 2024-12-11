import { Injectable } from '@nestjs/common';
import {
  MongooseOptionsFactory,
  MongooseModuleOptions,
} from '@nestjs/mongoose';
import { SecretService } from 'libs/modules/global/secret/secret.service';

@Injectable()
export class MongooseConfigService implements MongooseOptionsFactory {
  constructor(private readonly secretService: SecretService) {}

  createMongooseOptions(): MongooseModuleOptions {
    return {
      uri: this.secretService.mongodb.uri,
      directConnection: true,
      autoIndex: true,
    };
  }
}
