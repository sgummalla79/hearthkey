# REST API and Database Standards

## 1. REST API conventions
- **Nouns, not verbs:** the HTTP method is the action, the URL is the resource. `GET /orders`, `POST /orders`, `DELETE /orders/{id}`; never `GET /getOrders`.
- Pluralize collections consistently (`users`, `vaults`, `items`). Nest only one level (`/vaults/{id}/items`).
- Version the API in the path (`/v1/...`). Breaking changes require a new version; additive changes do not.
- Strict status code semantics. Never return 200 for an error.
  - `200 OK` success for GET/PUT/PATCH
  - `201 Created` for POST, with a `Location` header
  - `204 No Content` for DELETE
  - `400` validation failure or malformed payload
  - `401` missing or invalid credentials
  - `403` authenticated but not permitted
  - `404` resource does not exist (also used to avoid leaking existence of other users' resources)
  - `409 Conflict` for sync/version conflicts
  - `429 Too Many Requests` with `Retry-After`
  - `500` unhandled system exceptions
- Standardized error payload on every error response (proposed shape; adjust if needed):

```json
{
  "error": {
    "code": "VALIDATION_FAILED",
    "message": "Human-readable summary",
    "details": [{ "field": "email", "issue": "must be a valid email" }],
    "requestId": "correlation-id"
  }
}
```

- `code` is a stable machine-readable constant; `message` never contains secrets or internals.
- Pagination is cursor-based with a server-enforced max page size from config. Mutations that may be retried are idempotent (idempotency keys for POST where needed). Use optimistic concurrency (version/ETag) for vault item updates.
- Every request has a correlation id propagated to logs and the error payload.
- The API contract is defined by shared Zod schemas and published as OpenAPI; contract changes need a contract test.

## 2. Database and data
- All schema changes are forward-only, reviewed migrations (Drizzle). Never edit an applied migration. Migrations run before deploy and must be backward compatible with the previous release (expand/contract).
- Foreign keys, NOT NULL, unique constraints, and indexes are declared in the schema, not assumed in code. Use transactions for multi-step writes (e.g. key rotation).
- Soft-delete only where the product requires restore; otherwise hard delete. Never store plaintext vault data, ever.
- Backups are automated, stored at a different provider, and restore-tested before each sprint release.
- Storage access goes only through `VaultRepository` and `BlobStore`; swapping providers must be a config change.
