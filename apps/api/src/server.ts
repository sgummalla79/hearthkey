import { buildApp } from './app.js';
import { loadConfig } from './config/config.js';

const config = loadConfig(process.env);
const app = await buildApp(config);

try {
  await app.listen({ host: config.host, port: config.port });
} catch (error) {
  app.log.error({ err: error }, 'failed to start');
  process.exitCode = 1;
}
