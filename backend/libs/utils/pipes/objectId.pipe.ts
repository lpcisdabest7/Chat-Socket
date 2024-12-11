import { Injectable, PipeTransform } from "@nestjs/common";
import { Types } from "mongoose";
import { BadRequestException } from "@nestjs/common";

@Injectable()
export class ObjectIdPipe implements PipeTransform<string> {
  transform(value: string): string {
    if (!Types.ObjectId.isValid(value)) {
      throw new BadRequestException(`${value} is not a valid ObjectId`);
    }
    return value;
  }
}
