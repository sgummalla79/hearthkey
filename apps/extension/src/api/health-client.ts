export type ApiStatus = 'ok' | 'unreachable';

export type FetchLike = (url: string) => Promise<{ readonly ok: boolean }>;

const HEALTH_PATH = '/v1/health';

/** Asks the API whether it is up. Never throws; network failures map to 'unreachable'. */
export async function fetchApiStatus(
  apiBaseUrl: string,
  fetchImpl: FetchLike = fetch,
): Promise<ApiStatus> {
  try {
    const response = await fetchImpl(`${apiBaseUrl}${HEALTH_PATH}`);
    return response.ok ? 'ok' : 'unreachable';
  } catch {
    return 'unreachable';
  }
}
