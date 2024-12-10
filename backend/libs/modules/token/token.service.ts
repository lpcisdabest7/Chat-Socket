import { Injectable } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { TokenPayloadDto } from "./dto/token-payload.dto";
import { SecretService } from "../global/secret/secret.service";
import { RoleType, TokenType } from "./token.type";

@Injectable()
export class TokenService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly secretService: SecretService
  ) {}

  async verify(token: string) {
    const decoded = await this.jwtService.verify(token);
    return decoded;
  }

  async createToken(data: {
    role: RoleType;
    userId: string;
    sessionDevice: string;
  }): Promise<TokenPayloadDto> {
    return new TokenPayloadDto({
      accessToken: await this.jwtService.signAsync(
        {
          userId: data.userId,
          type: TokenType.ACCESS_TOKEN,
          role: data.role,
          sessionDevice: data.sessionDevice,
        },
        { expiresIn: this.secretService.authentication.accessExpireTime }
      ),
      refreshToken: await this.jwtService.signAsync(
        {
          userId: data.userId,
          type: TokenType.REFRESH_TOKEN,
          role: data.role,
          sessionDevice: data.sessionDevice,
        },
        { expiresIn: this.secretService.authentication.refreshExpireTime }
      ),
    });
  }

  async createTokenNoExp(data: {
    role: RoleType;
    userId: string;
    sessionDevice: string;
  }): Promise<TokenPayloadDto> {
    return new TokenPayloadDto({
      accessToken: await this.jwtService.signAsync({
        userId: data.userId,
        type: TokenType.ACCESS_TOKEN,
        role: data.role,
        sessionDevice: data.sessionDevice,
      }),
    });
  }
}
