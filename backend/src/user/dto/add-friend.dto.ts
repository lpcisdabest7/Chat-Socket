import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsString } from 'class-validator';

export class AddFriendDto {
  @IsArray()
  @ApiProperty({
    example: ['67591224b5e5d530e7a174f6', '67593e657ac963c1d2fc91f6'],
  })
  idFriends: string | string[];
}
