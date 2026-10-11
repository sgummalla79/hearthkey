import { strings } from '../i18n/strings';
import type { ApiStatus } from './health-client';

export type StatusView = ApiStatus | 'checking';

export function statusText(status: StatusView): string {
  switch (status) {
    case 'checking':
      return strings.apiStatusChecking;
    case 'ok':
      return strings.apiStatusOk;
    case 'unreachable':
      return strings.apiStatusUnreachable;
  }
}
