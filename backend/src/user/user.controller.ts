import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  Put,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserService } from './user.service';
import { Auth, ObjectIdParam } from '@libs/utils/decorators/http.decorator';
import { User } from './user.schema';
import { AuthUser } from '@libs/utils/decorators/auth-user.decorator';
import { AddFriendDto } from './dto/add-friend.dto';

@ApiTags('User')
@Controller({
  path: 'user',
  version: '1',
})
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get('/friends')
  @Auth()
  @HttpCode(HttpStatus.OK)
  async getFriends(@AuthUser() user: User) {
    return await this.userService.getFriends(user.id);
  }

  @Post('/add/friends')
  @Auth()
  @HttpCode(HttpStatus.OK)
  async addFriends(@AuthUser() user: User, @Body() dto: AddFriendDto) {
    return await this.userService.addFriends(user.id, dto);
  }

  @Patch('/update-profile/:userId')
  @HttpCode(HttpStatus.OK)
  async updateProfileUser(
    @ObjectIdParam('userId') userId: string,
    @Body() updateUserDto: UpdateUserDto,
  ) {
    return await this.userService.updateProfileUser(userId, updateUserDto);
  }
}
