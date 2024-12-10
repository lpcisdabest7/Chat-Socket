import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { DateTime } from 'luxon';
import { Response } from 'express';
import { ApiException, ErrorModel } from '../exception';
import * as errorStatus from '../static/http-status.json';
import { LoggerService } from '../../modules/global/logger/logger.service';
import { ERROR_CODE } from '../const';
import { makeData2SSE } from '../util';

@Catch()
export class AppExceptionFilter implements ExceptionFilter {
  constructor(private readonly loggerService: LoggerService) {}

  catch(exception: ApiException, host: ArgumentsHost): void {
    const context = host.switchToHttp();
    const response = context.getResponse<Response>();
    const request = context.getRequest();

    const status =
      exception instanceof HttpException
        ? exception.getStatus()
        : [exception['status'], HttpStatus.INTERNAL_SERVER_ERROR].find(Boolean);
    const exceptionResponse = exception?.getResponse() as any;
    const errorCode =
      exceptionResponse?.errorCode ||
      ERROR_CODE.INTERNAL_SERVER_ERROR.errorCode;
    exception.traceid = [exception.traceid, request['id']].find(Boolean);
    this.loggerService.error(exception, exception.message, exception.context);

    if (response.getHeader('Content-Type') === 'text/event-stream') {
      response.write(
        makeData2SSE({
          isSuccess: false,
          message: [exception.message, errorStatus[String(status)]].find(
            Boolean,
          ),
        }),
      );
      response.end();
      return;
    }

    response.status(status).json({
      error: {
        code: status,
        traceid: exception.traceid,
        message: [exception.message, errorStatus[String(status)]].find(Boolean),
        errorCode,
        timestamp: DateTime.fromJSDate(new Date())
          .setZone(process.env.TZ)
          .toFormat('dd/MM/yyyy HH:mm:ss'),
        path: request.url,
      },
    } as ErrorModel);
  }
}
