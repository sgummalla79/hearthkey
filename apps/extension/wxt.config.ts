import { defineConfig } from 'wxt';
import { asOptionalString, loadClientConfig } from './src/config/client-config';
import { strings } from './src/i18n/strings';

// The API origin is build-time configuration and the only host the extension may call.
const API_HOST_PERMISSION_SUFFIX = '/*';

const rawApiBaseUrl = asOptionalString(process.env.WXT_API_BASE_URL);

export default defineConfig({
  modules: ['@wxt-dev/module-react'],
  manifest: {
    name: strings.appTitle,
    description: strings.tagline,
    host_permissions:
      rawApiBaseUrl === undefined
        ? []
        : [
            `${loadClientConfig({ apiBaseUrl: rawApiBaseUrl }).apiBaseUrl}${API_HOST_PERMISSION_SUFFIX}`,
          ],
  },
  hooks: {
    // Builds (not type generation) must have a valid API origin.
    'build:before': () => {
      loadClientConfig({ apiBaseUrl: rawApiBaseUrl });
    },
  },
});
