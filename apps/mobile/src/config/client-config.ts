export interface ClientConfig {
  readonly apiBaseUrl: string;
}

export interface RawClientConfig {
  readonly apiBaseUrl: string | undefined;
}

/** Variable name Expo inlines at build time (must be referenced statically by the caller). */
export const API_BASE_URL_ENV_NAME = 'EXPO_PUBLIC_API_BASE_URL';

const TRAILING_SLASHES = /\/+$/;

/** Validates client configuration at startup; throws when anything is missing or invalid. */
export function loadClientConfig(raw: RawClientConfig): ClientConfig {
  if (raw.apiBaseUrl === undefined || raw.apiBaseUrl === '') {
    throw new Error(`${API_BASE_URL_ENV_NAME} is required`);
  }
  const parsed = new URL(raw.apiBaseUrl);
  return { apiBaseUrl: parsed.toString().replace(TRAILING_SLASHES, '') };
}

/** Narrows an untyped environment value (process.env is loosely typed in React Native). */
export function asOptionalString(value: unknown): string | undefined {
  return typeof value === 'string' ? value : undefined;
}
