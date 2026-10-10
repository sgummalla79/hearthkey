import { z } from 'zod';

/**
 * All tunable values come from the environment and are validated at startup.
 * The process fails fast when anything is missing or invalid.
 */
const configSchema = z.object({
  HEARTHKEY_API_PORT: z.coerce.number().int().min(1).max(65535),
  HEARTHKEY_DATABASE_URL: z.string().min(1),
  HEARTHKEY_REQUEST_BODY_LIMIT_BYTES: z.coerce.number().int().positive(),
  HEARTHKEY_PAGE_SIZE_MAX: z.coerce.number().int().positive(),
});

export interface AppConfig {
  readonly port: number;
  readonly databaseUrl: string;
  readonly requestBodyLimitBytes: number;
  readonly pageSizeMax: number;
}

export function loadConfig(env: Record<string, string | undefined>): AppConfig {
  const parsed = configSchema.parse(env);
  return {
    port: parsed.HEARTHKEY_API_PORT,
    databaseUrl: parsed.HEARTHKEY_DATABASE_URL,
    requestBodyLimitBytes: parsed.HEARTHKEY_REQUEST_BODY_LIMIT_BYTES,
    pageSizeMax: parsed.HEARTHKEY_PAGE_SIZE_MAX,
  };
}
