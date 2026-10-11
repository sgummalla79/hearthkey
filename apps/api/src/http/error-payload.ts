/** Standard error body returned on every error response. */
export interface ErrorPayload {
  readonly error: {
    readonly code: string;
    readonly message: string;
    readonly details?: readonly { readonly field: string; readonly issue: string }[];
    readonly requestId: string;
  };
}

export function buildErrorPayload(
  code: string,
  message: string,
  requestId: string,
  details?: ErrorPayload['error']['details'],
): ErrorPayload {
  return {
    error: { code, message, requestId, ...(details === undefined ? {} : { details }) },
  };
}
