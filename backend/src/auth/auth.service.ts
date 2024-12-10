import { Injectable, NotFoundException } from '@nestjs/common';
import { UserLoginDto } from './dto/user-login.dto';
import { validateHash } from '@libs/utils/util';
import { TokenService } from '@libs/modules/token/token.service';
import { IAuthSocialProfile } from './dto/auth.interface';
import { AuthProvider } from './auth.type';
import { UserService } from 'src/user/user.service';
import { User } from 'src/user/user.schema';

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UserService,
    private readonly tokenService: TokenService,
  ) {}

  async validateUser(userLoginDto: UserLoginDto) {
    const user = await this.userService.findOne({ email: userLoginDto.email });
    const isPasswordValid = await validateHash(
      userLoginDto.password,
      user?.password,
    );

    if (!isPasswordValid) {
      throw new NotFoundException('Not found user.');
    }

    return user;
  }

  async refreshToken(data: User) {
    const token = await this.pairToken(data);

    return {
      user: data,
      token,
    };
  }

  async handleLoginBySocial(
    socialUser: IAuthSocialProfile,
    authProvider: AuthProvider,
  ) {
    const user = await this.userService.createIfNotExistSocialUser(
      socialUser,
      authProvider,
    );

    return user;
  }

  async pairToken(user: User) {
    const token = await this.tokenService.createToken({
      userId: user.id,
      role: user.role,
      sessionDevice: user.sessionDevice,
    });

    return token;
  }

  async logout(user: User) {
    await this.userService.resetSessionDevice(user);
  }
}
