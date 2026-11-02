import * as Sentry from '@sentry/react-native';

/**
 * Initialize Sentry for error tracking and analytics
 * Call this in App.tsx before rendering
 */
export const initAnalytics = () => {
  const dsn = process.env.EXPO_PUBLIC_SENTRY_DSN;

  if (!dsn) {
    console.warn('Sentry DSN not configured. Error tracking disabled.');
    return;
  }

  Sentry.init({
    dsn,
    enableInExpoDevelopment: false, // Disable in development
    debug: __DEV__, // Enable debug in development
    environment: __DEV__ ? 'development' : 'production',
    tracesSampleRate: 1.0, // 100% of transactions for now
    beforeSend(event) {
      // Filter out sensitive data
      if (event.request?.headers) {
        delete event.request.headers['Authorization'];
      }
      return event;
    },
  });
};

/**
 * Log an error to Sentry
 */
export const logError = (error: Error, context?: Record<string, any>) => {
  if (context) {
    Sentry.setContext('error_context', context);
  }
  Sentry.captureException(error);
};

/**
 * Log a message to Sentry
 */
export const logMessage = (message: string, level: Sentry.SeverityLevel = 'info') => {
  Sentry.captureMessage(message, level);
};

/**
 * Set user context for analytics
 */
export const setUser = (userId: string, email?: string, username?: string) => {
  Sentry.setUser({
    id: userId,
    email,
    username,
  });
};

/**
 * Clear user context
 */
export const clearUser = () => {
  Sentry.setUser(null);
};

/**
 * Add breadcrumb for tracking user actions
 */
export const addBreadcrumb = (message: string, category: string, data?: Record<string, any>) => {
  Sentry.addBreadcrumb({
    message,
    category,
    level: 'info',
    data,
  });
};

