import type { FastifyError, FastifyReply, FastifyRequest } from 'fastify';
import { ERROR_CODE, ERROR_MESSAGE } from './error-codes.js';
import { buildErrorPayload } from './error-payload.js';

const HTTP_BAD_REQUEST = 400;
const HTTP_NOT_FOUND = 404;
const HTTP_PAYLOAD_TOO_LARGE = 413;
const HTTP_INTERNAL_SERVER_ERROR = 500;
const HTTP_CLIENT_ERROR_MIN = 400;
const HTTP_SERVER_ERROR_MIN = 500;

/** Single place where errors become HTTP responses. */
export function errorHandler(
  error: FastifyError,
  request: FastifyRequest,
  reply: FastifyReply,
): FastifyReply {
  const status = error.statusCode ?? HTTP_INTERNAL_SERVER_ERROR;

  if (status >= HTTP_SERVER_ERROR_MIN) {
    request.log.error({ err: error }, 'unhandled error');
    return reply
      .status(HTTP_INTERNAL_SERVER_ERROR)
      .send(buildErrorPayload(ERROR_CODE.INTERNAL_ERROR, ERROR_MESSAGE.INTERNAL_ERROR, request.id));
  }

  if (status === HTTP_PAYLOAD_TOO_LARGE) {
    return reply
      .status(status)
      .send(
        buildErrorPayload(
          ERROR_CODE.PAYLOAD_TOO_LARGE,
          ERROR_MESSAGE.PAYLOAD_TOO_LARGE,
          request.id,
        ),
      );
  }

  const clientStatus = status >= HTTP_CLIENT_ERROR_MIN ? status : HTTP_BAD_REQUEST;
  return reply
    .status(clientStatus)
    .send(
      buildErrorPayload(ERROR_CODE.VALIDATION_FAILED, ERROR_MESSAGE.VALIDATION_FAILED, request.id),
    );
}

export function notFoundHandler(request: FastifyRequest, reply: FastifyReply): FastifyReply {
  return reply
    .status(HTTP_NOT_FOUND)
    .send(buildErrorPayload(ERROR_CODE.NOT_FOUND, ERROR_MESSAGE.NOT_FOUND, request.id));
}
