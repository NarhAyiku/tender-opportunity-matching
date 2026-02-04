/**
 * Error Logging Service
 *
 * Centralized error handling and logging for the application.
 * Logs errors to console in development and can be extended to send to backend.
 */

const isDev = import.meta.env.DEV;

// Error severity levels
export const ErrorLevel = {
  INFO: 'info',
  WARNING: 'warning',
  ERROR: 'error',
  CRITICAL: 'critical'
};

// Error categories
export const ErrorCategory = {
  AUTH: 'auth',
  API: 'api',
  NETWORK: 'network',
  UI: 'ui',
  UNKNOWN: 'unknown'
};

// In-memory error store (for debugging)
const errorStore = [];
const MAX_STORED_ERRORS = 50;

/**
 * Log an error with context
 */
export function logError(error, context = {}) {
  const errorEntry = {
    timestamp: new Date().toISOString(),
    message: error?.message || String(error),
    stack: error?.stack,
    level: context.level || ErrorLevel.ERROR,
    category: context.category || ErrorCategory.UNKNOWN,
    component: context.component || 'unknown',
    action: context.action || 'unknown',
    userId: context.userId || null,
    metadata: context.metadata || {},
    url: window.location.href,
    userAgent: navigator.userAgent
  };

  // Store in memory
  errorStore.unshift(errorEntry);
  if (errorStore.length > MAX_STORED_ERRORS) {
    errorStore.pop();
  }

  // Console logging in development
  if (isDev) {
    const style = getConsoleStyle(errorEntry.level);
    console.group(`%c[${errorEntry.level.toUpperCase()}] ${errorEntry.category}`, style);
    console.log('Message:', errorEntry.message);
    console.log('Component:', errorEntry.component);
    console.log('Action:', errorEntry.action);
    if (errorEntry.stack) {
      console.log('Stack:', errorEntry.stack);
    }
    if (Object.keys(errorEntry.metadata).length > 0) {
      console.log('Metadata:', errorEntry.metadata);
    }
    console.groupEnd();
  }

  // In production, send to backend (implement when needed)
  if (!isDev && errorEntry.level === ErrorLevel.CRITICAL) {
    sendErrorToBackend(errorEntry);
  }

  return errorEntry;
}

/**
 * Log API errors specifically
 */
export function logApiError(error, endpoint, method = 'GET') {
  return logError(error, {
    level: error?.status >= 500 ? ErrorLevel.CRITICAL : ErrorLevel.ERROR,
    category: ErrorCategory.API,
    component: 'API',
    action: `${method} ${endpoint}`,
    metadata: {
      status: error?.status,
      endpoint,
      method
    }
  });
}

/**
 * Log authentication errors
 */
export function logAuthError(error, action) {
  return logError(error, {
    level: ErrorLevel.WARNING,
    category: ErrorCategory.AUTH,
    component: 'Auth',
    action
  });
}

/**
 * Log network errors
 */
export function logNetworkError(error) {
  return logError(error, {
    level: ErrorLevel.ERROR,
    category: ErrorCategory.NETWORK,
    component: 'Network',
    action: 'fetch',
    metadata: {
      online: navigator.onLine
    }
  });
}

/**
 * Get stored errors (for debugging)
 */
export function getStoredErrors() {
  return [...errorStore];
}

/**
 * Clear stored errors
 */
export function clearStoredErrors() {
  errorStore.length = 0;
}

/**
 * Get console style based on error level
 */
function getConsoleStyle(level) {
  const styles = {
    [ErrorLevel.INFO]: 'color: #3b82f6; font-weight: bold;',
    [ErrorLevel.WARNING]: 'color: #f59e0b; font-weight: bold;',
    [ErrorLevel.ERROR]: 'color: #ef4444; font-weight: bold;',
    [ErrorLevel.CRITICAL]: 'color: #ffffff; background: #dc2626; font-weight: bold; padding: 2px 4px;'
  };
  return styles[level] || styles[ErrorLevel.ERROR];
}

/**
 * Send error to backend (placeholder - implement when backend endpoint exists)
 */
async function sendErrorToBackend(errorEntry) {
  try {
    // TODO: Implement when backend has error logging endpoint
    // await fetch('/api/errors/log', {
    //   method: 'POST',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify(errorEntry)
    // });
    console.warn('[ErrorLogger] Would send to backend:', errorEntry);
  } catch (e) {
    console.error('[ErrorLogger] Failed to send error to backend:', e);
  }
}

/**
 * Global error handler setup
 */
export function setupGlobalErrorHandlers() {
  // Handle unhandled promise rejections
  window.addEventListener('unhandledrejection', (event) => {
    // AbortErrors are expected from Supabase client during auth transitions — suppress
    const reason = event.reason;
    if (reason?.name === 'AbortError' || reason?.message?.includes('aborted')) {
      event.preventDefault();
      return;
    }
    logError(reason, {
      level: ErrorLevel.ERROR,
      category: ErrorCategory.UNKNOWN,
      component: 'Global',
      action: 'unhandledrejection'
    });
  });

  // Handle uncaught errors
  window.addEventListener('error', (event) => {
    logError(event.error || event.message, {
      level: ErrorLevel.CRITICAL,
      category: ErrorCategory.UI,
      component: 'Global',
      action: 'uncaughterror',
      metadata: {
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno
      }
    });
  });

  console.log('[ErrorLogger] Global error handlers initialized');
}

export default {
  logError,
  logApiError,
  logAuthError,
  logNetworkError,
  getStoredErrors,
  clearStoredErrors,
  setupGlobalErrorHandlers,
  ErrorLevel,
  ErrorCategory
};
