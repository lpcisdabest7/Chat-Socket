import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { AuthService } from '../auth/auth.service';
import { AuthGoogleService } from './auth-google.service';
import { AuthGoogleLoginDto } from './dto/auth-google-login.dto';

@ApiTags('Auth')
@Controller({
  path: 'auth/google',
  version: '1',
})
export class AuthGoogleController {
  constructor(
    private readonly authService: AuthService,
    private readonly authGoogleService: AuthGoogleService,
  ) {}

  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(@Body() loginDto: AuthGoogleLoginDto) {
    const socialData = await this.authGoogleService.getProfileByToken(loginDto);

    const user = await this.authService.handleLoginBySocial(
      socialData,
      'google',
    );
    const tokens = await this.authService.pairToken(user);

    return {
      user,
      tokens,
    };
  }
}
