import {
  Injectable,
  InternalServerErrorException,
  Scope,
} from "@nestjs/common";
import {
  gray as coloretteGray,
  green as coloretteGreen,
  isColorSupported,
  red as coloretteRed,
  yellow as coloretteYellow,
} from "colorette";
import { DateTime } from "luxon";
import { HttpLogger, Options, pinoHttp } from "pino-http";
import { v4 as uuidv4 } from "uuid";
import { ApiException } from "../../../utils/exception";
import { ErrorType, MessageType } from "./logger.type";
import { LevelWithSilent, Logger, multistream, pino } from "pino";
import { IncomingMessage } from "http";
import { ServerResponse } from "http";
import pinoPretty from "pino-pretty";

const isProduction = process.env.NODE_ENV?.includes("production");
const colorize = {
  red: (context: any) => (isProduction ? context : coloretteRed(context)),
  gray: (context: any) => (isProduction ? context : coloretteGray(context)),
  yellow: (context: any) => (isProduction ? context : coloretteYellow(context)),
  green: (context: any) => (isProduction ? context : coloretteGreen(context)),
};

@Injectable({ scope: Scope.REQUEST })
export class LoggerService {
  pino: HttpLogger;
  private app: string;

  connect<T = LevelWithSilent>(logLevel: T): void {
    const pinoLogger = pino(
      {
        level: [logLevel, "trace"].find(Boolean).toString(),
      },
      multistream([
        {
          level: "trace",
          stream: pinoPretty(this.getPinoConfig()),
        },
      ])
    );

    this.pino = pinoHttp(this.getPinoHttpConfig(pinoLogger));
  }

  setApplication(app: string): void {
    this.app = app;
  }

  log(message: string): void {
    this.pino.logger.trace(colorize.green(message));
  }

  trace({ message, context, obj = {} }: MessageType): void {
    Object.assign(obj, { context });
    this.pino.logger.trace(
      [obj, colorize.gray(message)].find(Boolean),
      colorize.gray(message)
    );
  }

  info({ message, context, obj = {} }: MessageType): void {
    Object.assign(obj, { context });
    this.pino.logger.info(
      [obj, colorize.green(message)].find(Boolean),
      colorize.green(message)
    );
  }

  warn({ message, context, obj = {} }: MessageType): void {
    Object.assign(obj, { context });
    this.pino.logger.warn(
      [obj, colorize.yellow(message)].find(Boolean),
      colorize.yellow(message)
    );
  }

  error(error: ErrorType, message?: string, context?: string): void {
    const errorResponse = this.getErrorResponse(error);

    const response =
      error?.name === ApiException.name
        ? { statusCode: error["statusCode"], message: error?.message }
        : errorResponse?.value();

    const type = {
      Error: ApiException.name,
    }[error?.name];

    this.pino.logger.error(
      {
        ...response,
        context: [context, this.app].find(Boolean),
        type: [type, error?.name].find(Boolean),
        traceid: this.getTraceId(error),
        timestamp: this.getDateFormat(),
        application: this.app,
        stack: error.stack,
      },
      colorize.red(message)
    );
  }

  fatal(error: ErrorType, message?: string, context?: string): void {
    this.pino.logger.fatal(
      {
        ...(error.getResponse() as object),
        context: [context, this.app].find(Boolean),
        type: error.name,
        traceid: this.getTraceId(error),
        timestamp: this.getDateFormat(),
        application: this.app,
        stack: error.stack,
      },
      colorize.red(message)
    );
  }

  private getPinoConfig() {
    return {
      colorize: isProduction ? !isColorSupported : isColorSupported,
      singleLine: isProduction ? true : false,
      levelFirst: true,
      ignore: "pid,hostname",
      quietReqLogger: true,
      messageFormat: (log: unknown, messageKey: string) => {
        const message = log[String(messageKey)];
        if (this.app) {
          return `[${this.app}] ${message}`;
        }

        return message;
      },
      customPrettifiers: {
        time: () => {
          return `[${this.getDateFormat()}]`;
        },
      },
    };
  }

  private getPinoHttpConfig(pinoLogger: Logger): Options {
    return {
      logger: pinoLogger,
      quietReqLogger: true,
      customSuccessMessage: (req: IncomingMessage, res: ServerResponse) => {
        return `request ${
          res.statusCode >= 400
            ? colorize.red("error")
            : colorize.green("success")
        } with status code: ${res.statusCode}`;
      },
      customErrorMessage: (
        req: IncomingMessage,
        res: ServerResponse,
        error: Error
      ) => {
        return `request ${colorize.red(error.name)} with status code: ${
          res.statusCode
        } `;
      },
      genReqId: (req: IncomingMessage) => {
        return req.headers.traceid;
      },
      // customAttributeKeys: {
      //   req: 'request',
      //   // res: 'response',
      //   err: 'error',
      //   responseTime: 'timeTaken',
      //   reqId: 'traceid',
      // },
      serializers: {
        err: () => false,
        // req: (request) => {
        //   return {
        //     method: request.method,
        //     // curl: PinoRequestConverter.getCurl(request),
        //   };
        // },
        req: () => false,
        res: () => false,
      },
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      customProps: (req: any): any => {
        const context = req.context;

        const traceid = [req?.headers?.traceid, req.id].find(Boolean);

        const path = `${req.protocol}://${req.headers.host}${req.url}`;

        this.pino.logger.setBindings({
          traceid,
          application: this.app,
          context: context,
          path,
          timestamp: this.getDateFormat(),
        });

        return {
          traceid,
          application: this.app,
          context: context,
          path,
          timestamp: this.getDateFormat(),
        };
      },
      customLogLevel: (
        req: IncomingMessage,
        res: ServerResponse,
        error: Error
      ) => {
        if ([res.statusCode >= 400, error].some(Boolean)) {
          return "error";
        }

        if ([res.statusCode >= 300, res.statusCode <= 400].every(Boolean)) {
          return "silent";
        }

        return "info";
      },
    };
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private getErrorResponse(error: ErrorType): any {
    const isFunction = typeof error?.getResponse === "function";
    return [
      {
        conditional: typeof error === "string",
        value: () => new InternalServerErrorException(error).getResponse(),
      },
      {
        conditional: isFunction && typeof error.getResponse() === "string",
        value: () =>
          new ApiException(
            error.getResponse(),
            [error.getStatus(), error["status"]].find(Boolean),
            error["context"]
          ).getResponse(),
      },
      {
        conditional: isFunction && typeof error.getResponse() === "object",
        value: () => error?.getResponse(),
      },
      {
        conditional: [
          error?.name === Error.name,
          error?.name == TypeError.name,
        ].some(Boolean),
        value: () =>
          new InternalServerErrorException(error.message).getResponse(),
      },
    ].find((c) => c.conditional);
  }

  private getDateFormat(
    date = new Date(),
    format = "dd/MM/yyyy HH:mm:ss"
  ): string {
    return DateTime.fromJSDate(date).setZone(process.env.TZ).toFormat(format);
  }

  private getTraceId(error: any): string {
    if (typeof error === "string") return uuidv4();
    return [error.traceid, this.pino.logger.bindings()?.tranceId].find(Boolean);
  }
}
