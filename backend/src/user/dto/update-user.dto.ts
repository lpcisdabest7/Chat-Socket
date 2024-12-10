import { ApiPropertyOptional } from "@nestjs/swagger";
import { IsBoolean } from "class-validator";

export class UpdateUserDto {
  // @ApiPropertyOptional({ default: false, required: false })
  // @IsBoolean()
  // isPremium?: boolean;
}
