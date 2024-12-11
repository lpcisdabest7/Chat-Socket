import { type INestApplication } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { LoggerService } from '@libs/modules/global/logger/logger.service';

export function setupSwagger(
  app: INestApplication,
  loggerService: LoggerService,
): void {
  const documentBuilder = new DocumentBuilder()
    .setTitle('API SOCKET')
    .addBearerAuth();

  const document = SwaggerModule.createDocument(app, documentBuilder.build());
  SwaggerModule.setup('docs', app, document, {
    swaggerOptions: {
      persistAuthorization: true,
    },
  });

  loggerService.log(`Documentation: http://localhost:${process.env.PORT}/docs`);
}
