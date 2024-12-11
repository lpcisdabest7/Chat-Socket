import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { SecretService } from '../global/secret/secret.service';
import { RoleType, TokenType } from './token.type';
import { InjectModel } from '@nestjs/mongoose';
import { User } from 'src/user/user.schema';
import { Model } from 'mongoose';

@Injectable()
export class JwtRefreshStrategy extends PassportStrategy(
  Strategy,
  'jwt-refresh',
) {
  constructor(
    private readonly secretService: SecretService,
    @InjectModel(User.name) private readonly userModel: Model<User>,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromHeader('x-refresh-token'),
      secretOrKey: secretService.authentication.secret,
    });
  }

  async validate(args: {
    userId: string;
    role: RoleType;
    type: TokenType;
    sessionDevice: string;
  }) {
    if (args.type !== TokenType.REFRESH_TOKEN) {
      throw new UnauthorizedException();
    }
    const user = await this.userModel.findOne({
      _id: args.userId,
      sessionDevice: args.sessionDevice,
    });
    if (!user) {
      throw new UnauthorizedException();
    }
    return user;
  }
}
