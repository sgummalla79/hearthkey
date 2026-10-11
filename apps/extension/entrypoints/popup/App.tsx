import { useEffect, useState } from 'react';
import { fetchApiStatus } from '../../src/api/health-client';
import { statusText, type StatusView } from '../../src/api/status-text';
import { asOptionalString, loadClientConfig } from '../../src/config/client-config';
import { strings } from '../../src/i18n/strings';

const config = loadClientConfig({
  apiBaseUrl: asOptionalString(import.meta.env.WXT_API_BASE_URL),
});

export function App() {
  const [status, setStatus] = useState<StatusView>('checking');

  useEffect(() => {
    void fetchApiStatus(config.apiBaseUrl).then(setStatus);
  }, []);

  return (
    <main className="popup">
      <h1>{strings.appTitle}</h1>
      <p>{strings.tagline}</p>
      <p aria-live="polite">
        {strings.apiStatusLabel}: {statusText(status)}
      </p>
    </main>
  );
}
