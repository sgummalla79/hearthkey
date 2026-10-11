import { useEffect, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { fetchApiStatus } from '../src/api/health-client';
import { statusText, type StatusView } from '../src/api/status-text';
import { asOptionalString, loadClientConfig } from '../src/config/client-config';
import { strings } from '../src/i18n/strings';

// Expo only inlines EXPO_PUBLIC_* variables referenced statically.
const config = loadClientConfig({
  apiBaseUrl: asOptionalString(process.env.EXPO_PUBLIC_API_BASE_URL),
});

export default function HomeScreen() {
  const [status, setStatus] = useState<StatusView>('checking');

  useEffect(() => {
    void fetchApiStatus(config.apiBaseUrl).then(setStatus);
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.title} accessibilityRole="header">
        {strings.appTitle}
      </Text>
      <Text style={styles.tagline}>{strings.tagline}</Text>
      <Text style={styles.status} accessibilityLiveRegion="polite">
        {strings.apiStatusLabel}: {statusText(status)}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24 },
  title: { fontSize: 32, fontWeight: '700', marginBottom: 8 },
  tagline: { fontSize: 16, textAlign: 'center', marginBottom: 24 },
  status: { fontSize: 14 },
});
