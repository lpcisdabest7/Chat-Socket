import { HttpException, HttpStatus } from "@nestjs/common";
import { ERROR_CODE } from "./const";

export type ErrorModel = {
  error: {
    code: string | number;
    traceid: string;
    message: string;
    timestamp: string;
    path: string;
  };
};

export class ApiException extends HttpException {
  context: string;
  traceid: string;
  statusCode: number;
  code?: string;
  config?: unknown;
  user?: string;
  errorCode?: string;

  constructor(
    error: string | object,
    status?: HttpStatus,
    errorCode?: string,
    private readonly ctx?: string
  ) {
    super(error, [status, 500].find(Boolean));
    this.statusCode = super.getStatus();
    this.errorCode = errorCode ?? ERROR_CODE.INTERNAL_SERVER_ERROR.errorCode;
    if (ctx) {
      this.context = ctx;
    }
  }
}
