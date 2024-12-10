import { StringFieldOptional } from '@libs/utils/decorators/field.decorator';
import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsOptional } from 'class-validator';

export class UpdateUserDto {
  @IsBoolean()
  @IsOptional()
  @ApiProperty({ default: true })
  isSet?: boolean;

  @StringFieldOptional()
  email: string;

  @StringFieldOptional()
  username: string;

  @StringFieldOptional()
  avatarImage: string;
}
