import { ERROR_CODE } from "@libs/utils/const";
import { ApiException } from "@libs/utils/exception";
import { PipeTransform, Injectable, HttpStatus } from "@nestjs/common";

@Injectable()
export class ImageValidationPipe implements PipeTransform {
  transform(file: Express.Multer.File) {
    if (file) {
      const allowedMimeTypes = [
        "image/jpeg",
        "image/png",
        "image/heif",
        "image/jpg",
      ];
      if (!allowedMimeTypes.includes(file.mimetype)) {
        throw new ApiException(
          "Invalid image type",
          HttpStatus.BAD_GATEWAY,
          ERROR_CODE.CLIENT_BAD_REQUEST.errorCode
        );
      }

      return file;
    }
  }
}
