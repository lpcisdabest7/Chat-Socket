import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { UserLoginDto } from './dto/user-login.dto';
import { Auth, AuthRefreshToken } from '@libs/utils/decorators/http.decorator';
import { RoleType } from '@libs/modules/token/token.type';
import { AuthUser } from '@libs/utils/decorators/auth-user.decorator';
import { AuthService } from './auth.service';
import { TokenService } from '@libs/modules/token/token.service';
import { UserRegisterDto } from './dto/user-register.dto';
import { UserService } from 'src/user/user.service';
import { User } from 'src/user/user.schema';

@Controller({
  path: 'auth',
  version: '1',
})
@ApiTags('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly tokenService: TokenService,
    private readonly userService: UserService,
  ) {}

  @Post('login')
  @HttpCode(HttpStatus.OK)
  async userLogin(@Body() userLoginDto: UserLoginDto) {
    const user = await this.authService.validateUser(userLoginDto);

    const token = await this.tokenService.createToken({
      userId: user.id,
      role: user.role,
      sessionDevice: user.sessionDevice,
    });

    return {
      user: user.toJSON(),
      token,
    };
  }

  @Post('logout')
  @HttpCode(HttpStatus.OK)
  @Auth([RoleType.USER, RoleType.ADMIN])
  async userLogout(@AuthUser() user: User) {
    return await this.authService.logout(user);
  }

  @Post('register')
  @HttpCode(HttpStatus.OK)
  async userRegister(@Body() userRegisterDto: UserRegisterDto) {
    const createdUser = await this.userService.createUser(userRegisterDto);
    return createdUser.toJSON();
  }

  @Get('me')
  @HttpCode(HttpStatus.OK)
  @Auth([RoleType.USER, RoleType.ADMIN])
  getCurrentUser(@AuthUser() user: User) {
    return user.toJSON();
  }

  @Post('refresh')
  @AuthRefreshToken()
  @HttpCode(HttpStatus.OK)
  async refreshToken(@AuthUser() user: User) {
    return await this.authService.refreshToken(user);
  }
}
