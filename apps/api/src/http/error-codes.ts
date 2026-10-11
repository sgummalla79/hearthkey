/** Stable machine-readable error codes returned to clients. */
export const ERROR_CODE = {
  NOT_FOUND: 'NOT_FOUND',
  VALIDATION_FAILED: 'VALIDATION_FAILED',
  PAYLOAD_TOO_LARGE: 'PAYLOAD_TOO_LARGE',
  INTERNAL_ERROR: 'INTERNAL_ERROR',
} as const;

/** Client-safe messages; internals are never exposed. */
export const ERROR_MESSAGE = {
  NOT_FOUND: 'The requested resource was not found.',
  VALIDATION_FAILED: 'The request is invalid.',
  PAYLOAD_TOO_LARGE: 'The request body is too large.',
  INTERNAL_ERROR: 'An unexpected error occurred.',
} as const;
