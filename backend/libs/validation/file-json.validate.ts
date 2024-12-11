import { ApiException } from "@libs/utils/exception";
import { PipeTransform, Injectable, HttpStatus } from "@nestjs/common";
import { ERROR_CODE } from "libs/utils/const";

@Injectable()
export class FileJsonValidationPipe implements PipeTransform {
  transform(file: Express.Multer.File) {
    if (!file) {
      throw new ApiException(
        ERROR_CODE.CLIENT_INVALID_PAYLOAD.message,
        HttpStatus.BAD_REQUEST,
        ERROR_CODE.CLIENT_INVALID_PAYLOAD.errorCode
      );
    }

    const allowedMimeTypes = ["application/json"];
    if (!allowedMimeTypes.includes(file.mimetype)) {
      throw new ApiException(
        "Invalid file type",
        HttpStatus.BAD_REQUEST,
        ERROR_CODE.CLIENT_BAD_REQUEST.errorCode
      );
    }

    return file;
  }
}
