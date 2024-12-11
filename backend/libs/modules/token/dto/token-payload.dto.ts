export class TokenPayloadDto {
  accessToken: string;
  refreshToken?: string;

  constructor(data: { accessToken: string; refreshToken?: string }) {
    this.accessToken = data.accessToken;
    this.refreshToken = data.refreshToken;
  }
}