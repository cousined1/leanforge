import * as Sentry from '@sentry/node';
import { config } from './env';

export function initializeMonitoring(): void {
  if (!config.SENTRY_DSN) {
    console.log('[MONITORING] Sentry disabled (SENTRY_DSN not configured)');
    return;
  }

  Sentry.init({
    dsn: config.SENTRY_DSN,
    environment: config.SENTRY_ENVIRONMENT || config.NODE_ENV,
    tracesSampleRate: config.NODE_ENV === 'production' ? 0.1 : 1.0,
  });

  console.log('[MONITORING] Sentry initialized');
}

export { Sentry };
