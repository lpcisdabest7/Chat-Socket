import { User } from 'src/user/user.schema';
import { TokenType } from '../token.type';

export type JwtRefreshPayloadType = {
  tokenType: TokenType;
  userId: string;
  role: User['role'];
  expiresIn: number;
};
