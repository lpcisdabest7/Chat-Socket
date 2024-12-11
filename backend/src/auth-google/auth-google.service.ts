import {
  HttpStatus,
  Injectable,
  UnprocessableEntityException,
} from '@nestjs/common';
import { OAuth2Client } from 'google-auth-library';
import { AuthGoogleLoginDto } from './dto/auth-google-login.dto';
import { SecretService } from '@libs/modules/global/secret/secret.service';
import { ApiException } from '@libs/utils/exception';
import { IAuthSocialProfile } from '../auth/dto/auth.interface';

@Injectable()
export class AuthGoogleService {
  private google: OAuth2Client;

  constructor(private secretService: SecretService) {
    this.google = new OAuth2Client(
      this.secretService.google.clientId,
      this.secretService.google.clientSecret,
    );
  }

  async getProfileByToken(
    loginDto: AuthGoogleLoginDto,
  ): Promise<IAuthSocialProfile> {
    try {
      const ticket = await this.google.verifyIdToken({
        idToken: loginDto.idToken,
      });

      const data = ticket.getPayload();

      if (!data) {
        throw new UnprocessableEntityException('Invalid token.');
      }

      return {
        id: data.sub,
        email: data.email,
        username: data.family_name + ' ' + data.given_name,
        avatarImage: data.picture,
      };
    } catch (error) {
      throw new ApiException(error, HttpStatus.BAD_REQUEST);
    }
  }
}
