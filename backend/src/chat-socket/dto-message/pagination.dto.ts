import { ApiProperty } from "@nestjs/swagger";
import { Type } from "class-transformer";
import {
  IsString,
  IsOptional,
  IsInt,
  Min,
  Max,
  IsMongoId,
} from "class-validator";

export class PaginationDto {
  @IsOptional()
  @ApiProperty({ required: false })
  @IsString()
  @IsMongoId({ message: "Cursor must be a valid ObjectId" })
  cursor?: string;

  @ApiProperty({ required: false, default: 10 })
  @IsInt()
  @Min(1)
  @Max(100)
  @Type(() => Number)
  limit: number = 10;
}
