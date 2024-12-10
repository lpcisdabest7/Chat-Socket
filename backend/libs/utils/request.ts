export interface ApiRequest extends Body {
  readonly id: string;
  readonly cache: RequestCache;
  readonly credentials: RequestCredentials;
  readonly destination: RequestDestination;
  readonly headers: Headers;
  readonly integrity: string;
  readonly keepalive: boolean;
  readonly method: string;
  readonly mode: RequestMode;
  readonly redirect: RequestRedirect;
  readonly referrer: string;
  readonly referrerPolicy: ReferrerPolicy;
  readonly signal: AbortSignal;
  readonly url: string;
  clone(): Request;
}
