// Environment configuration
// Access environment variables through this config for type safety

export const config = {
  apiUrl: import.meta.env.VITE_API_URL || 'http://localhost:8000',
  appEnv: import.meta.env.VITE_APP_ENV || 'development',
  appName: import.meta.env.VITE_APP_NAME || 'TENDER',
  isDev: import.meta.env.VITE_APP_ENV === 'development',
  isProd: import.meta.env.VITE_APP_ENV === 'production',
} as const;

export default config;
