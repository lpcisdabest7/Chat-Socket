import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Param,
  Put,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserService } from './user.service';
import { ObjectIdParam } from '@libs/utils/decorators/http.decorator';

@ApiTags('User')
@Controller({
  path: 'user',
  version: '1',
})
export class UserController {
  constructor(private readonly userService: UserService) {}

  // @Put("/update-profile/:userId")
  // @HttpCode(HttpStatus.OK)
  // async updateProfileUser(
  //   @ObjectIdParam("userId") userId: string,
  //   @Body() updateUserDto: UpdateUserDto
  // ) {
  //   return await this.userService.updateProfileUser(userId, updateUserDto);
  // }
}
