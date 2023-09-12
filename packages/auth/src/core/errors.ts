export interface ThirdwebCreateErrorConstructorArgs {
  code: string;
  message: string;
  statusCode: number;
}
export interface ThirdwebErrorConstructorArgs<Variables = undefined> {
  innerError?: Error;
  variables: Variables;
}

/**
 * Replaces all instances of ${key} with the corresponding value in substitutions
 * Eg: formatString("Hello ${name}", { name: "John" }) => "Hello John"
 */
function formatString(
  template: string,
  substitutions: { [key: string]: any }
): string {
  return template.replace(/\$\{(\w+)\}/g, (_match, p1) => {
    return substitutions[p1] !== undefined ? substitutions[p1] : _match;
  });
}

type OverrideOptions<Variables> = Partial<
  ThirdwebErrorConstructorArgs<Variables>
>;
type OverrideOptionsWithVariables<Variables> =
  ThirdwebErrorConstructorArgs<Variables>;

export function createThirdwebError<Variables = undefined>(
  options: ThirdwebCreateErrorConstructorArgs
) {
  class ThirdwebError extends Error {
    public code: string;
    public message: string;
    public innerError: Error | null;
    public variables: any;
    public statusCode: number;

    constructor(
      ...[overrideOptions]: Variables extends undefined
        ? [OverrideOptions<Variables>?]
        : [OverrideOptionsWithVariables<Variables>]
    ) {
      const code = options.code;
      const innerError = overrideOptions?.innerError ?? null;
      const variables = overrideOptions?.variables ?? {};

      const unformattedMessage = options.message;
      const message = formatString(unformattedMessage, variables);

      super(message);

      this.code = code;
      this.message = message;
      this.name = 'ThirdwebError';
      this.innerError = innerError;
      this.variables = variables;
      this.statusCode = options.statusCode;

      if (Error.stackTraceLimit !== 0) {
        Error.captureStackTrace(this, ThirdwebError)
      }
    }
  }

  return ThirdwebError;
}

export const ThirdwebAuthErrors = {
  InvalidTokenId: createThirdwebError({
    code: 'INVALID_TOKEN_ID',
    message: 'The token ID is invalid.',
    statusCode: 400 // TODO: Replace with http status package
  }),

  InvalidTokenDomain: createThirdwebError<{
    expectedDomain: string;
    actualDomain: string;
  }>({
    code: 'INVALID_TOKEN_DOMAIN',
    message: "Expected token to be for the domain '${expectedDomain}', but found token with domain '${actualDomain}'.",
    statusCode: 401,
  }),

  InvalidTokenTimeBefore: createThirdwebError<{
    notBeforeTime: number;
    currentTime: number;
  }>({
    code: 'INVALID_NOT_BEFORE_TIME',
    message: "This token is invalid before epoch time '${nbf}', current epoch time is '${currentTime}'.",
    statusCode: 401,
  }),

  ExpiredToken: createThirdwebError<{
    expirationTime: number;
    currentTime: number;
  }> ({
    code: 'EXPIRED_TOKEN',
    message: "This token expired at epoch time '${expirationTime}', current epoch time is '${currentTime}'.",
    statusCode: 401,
  }),

  TokenIssuerMismatch: createThirdwebError<{
    expectedIssuer: string;
    actualIssuer: string;
  }> ({
    code: 'TOKEN_ISSUER_MISMATCH',
    message: "Expected token to be issued by '${expectedIssuer}', but found token issued by '${actualIssuer}'.",
    statusCode: 401,
  }),

  TokenInvalidSignature: createThirdwebError<{
    signerAddress: string;
  }> ({
    code: 'TOKEN_INVALID_SIGNATURE',
    message: "The token was signed by '${signerAddress}', but the signature is invalid or missing.",
    statusCode: 401,
  })
}