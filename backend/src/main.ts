import 'module-alias/register';
import {
  HttpStatus,
  RequestMethod,
  ValidationPipe,
  VersioningType,
} from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { LoggerService } from '@libs/modules/global/logger/logger.service';
import { AppExceptionFilter } from '@libs/utils/filters/http-exception.filter';
import { ExceptionInterceptor } from '@libs/utils/interceptors/http-exception.interceptor';
import { HttpLoggerInterceptor } from '@libs/utils/interceptors/http-logger.interceptor';
import { SecretService } from '@libs/modules/global/secret/secret.service';
import { bold } from 'colorette';
import {
  ExpressAdapter,
  type NestExpressApplication,
} from '@nestjs/platform-express';
import helmet from 'helmet';
import { setupSwagger } from './setup-swagger';
import { HttpInterceptor } from '@libs/utils/interceptors/http-response.interceptor';
import { PrometheusMiddleware } from '@libs/utils/middlerware/prometheus.middleware';
import { IoAdapter } from '@nestjs/platform-socket.io';

async function bootstrap() {
  const name = 'api swagger';
  const app = await NestFactory.create<NestExpressApplication>(
    AppModule,
    new ExpressAdapter(),
    {
      bufferLogs: true,
      cors: true,
    },
  );
  app.useWebSocketAdapter(new IoAdapter(app));

  app.enable('trust proxy'); // only if you're behind a reverse proxy (Heroku, Bluemix, AWS ELB, Nginx, etc)
  app.use(helmet());
  app.use(PrometheusMiddleware);

  const loggerService = app.get(LoggerService);
  loggerService.setApplication(name);
  app.useLogger(loggerService);

  app.enableVersioning({ type: VersioningType.URI });
  app.useGlobalPipes(
    new ValidationPipe({
      errorHttpStatusCode: HttpStatus.PRECONDITION_FAILED,
      transform: true,
    }),
  );

  app.useGlobalFilters(new AppExceptionFilter(loggerService));

  app.useGlobalInterceptors(
    new ExceptionInterceptor(),
    new HttpLoggerInterceptor(loggerService),
    new HttpInterceptor(),
  );

  const { application } = app.get(SecretService);

  app.setGlobalPrefix('api', {
    exclude: [
      { path: '/health', method: RequestMethod.GET },
      { path: '/metrics', method: RequestMethod.GET },
    ],
  });

  if (application.ENABLE_DOCS) {
    setupSwagger(app, loggerService);
  }

  await app.listen(application.PORT);
  loggerService.log(
    `🟢 ${name} listening at ${bold(application.PORT)} on ${bold(
      application.NODE_ENV,
    )} 🟢\n`,
  );
}
bootstrap();
