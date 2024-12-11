export const ERROR_CODE = {
  GLOBAL_TIMEOUT: {
    message: "Global request timeout has occurred.",
    errorCode: "ERR01",
  },
  CLIENT_INVALID_PAYLOAD: {
    message: "Invalid payload.",
    errorCode: "ERR01",
  },
  CLIENT_MISSING_PARAMS: {
    message: "Missing client params: ",
    errorCode: "ERR03",
  },
  CLIENT_BAD_REQUEST: {
    message: "Invalid input.",
    errorCode: "ERR04",
  },
  INTERNAL_SERVER_ERROR: {
    message: "Unexpected internal server error.",
    errorCode: "ERR05",
  },
  PAYLOAD_TOO_LARGE: {
    message: "File too large",
    errorCode: "ERR06",
  },
  IMAGE_IS_NOT_VALID_SUBJECT: {
    message: "The image does not contain a valid knowledge of the subject.",
    errorCode: "ERR07",
  },
  INVALID_API_KEY: {
    message: "Incorrect API key provided",
    errorCode: "ERR08",
  },
  TOKEN_HAS_EXPIRED: {
    message: "Token has expired",
    errorCode: "ERR09",
  },
  INVALID_TOKEN: {
    message: "Invalid token",
    errorCode: "ERR10",
  },
};
