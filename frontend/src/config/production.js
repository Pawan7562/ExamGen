// Frontend production configuration
const config = {
  // API Configuration
  api: {
    baseURL: import.meta.env.VITE_API_URL || '/api/v1',
    timeout: 10000,
    retries: 3,
    retryDelay: 1000,
  },

  // App Configuration
  app: {
    name: import.meta.env.VITE_APP_NAME || 'Exam Monitoring System',
    version: import.meta.env.VITE_APP_VERSION || '1.0.0',
    environment: import.meta.env.MODE || 'development',
    buildTime: import.meta.env.VITE_BUILD_TIME || new Date().toISOString(),
  },

  // Authentication Configuration
  auth: {
    tokenKey: 'token',
    userKey: 'user',
    refreshThreshold: 5 * 60 * 1000, // 5 minutes before expiry
    logoutRedirect: '/login',
    loginRedirect: '/dashboard',
  },

  // UI Configuration
  ui: {
    theme: {
      primary: '#1890ff',
      success: '#52c41a',
      warning: '#faad14',
      error: '#ff4d4f',
      info: '#1890ff',
    },
    layout: {
      headerHeight: 64,
      siderWidth: 256,
      siderCollapsedWidth: 80,
      footerHeight: 48,
    },
    pagination: {
      defaultPageSize: 10,
      pageSizeOptions: ['10', '20', '50', '100'],
    },
  },

  // Feature Flags
  features: {
    enableNotifications: true,
    enableRealTimeUpdates: true,
    enableProctoring: true,
    enableAnalytics: true,
    enableDarkMode: true,
    enableMultiLanguage: false,
  },

  // Error Handling
  errorHandling: {
    enableGlobalErrorBoundary: true,
    enableErrorReporting: import.meta.env.PROD,
    maxRetries: 3,
    retryDelay: 1000,
  },

  // Performance
  performance: {
    enableLazyLoading: true,
    enableCodeSplitting: true,
    enableServiceWorker: import.meta.env.PROD,
    enableCaching: true,
    cacheTimeout: 5 * 60 * 1000, // 5 minutes
  },

  // Security
  security: {
    enableCSRFProtection: true,
    enableXSSProtection: true,
    enableContentSecurityPolicy: import.meta.env.PROD,
    sessionTimeout: 30 * 60 * 1000, // 30 minutes
  },

  // Monitoring
  monitoring: {
    enableAnalytics: import.meta.env.PROD,
    enablePerformanceMonitoring: import.meta.env.PROD,
    enableErrorTracking: import.meta.env.PROD,
    analyticsEndpoint: import.meta.env.VITE_ANALYTICS_ENDPOINT,
  },

  // Development specific
  development: {
    enableMockData: import.meta.env.DEV,
    enableDebugMode: import.meta.env.DEV,
    enableHotReload: import.meta.env.DEV,
    logLevel: import.meta.env.DEV ? 'debug' : 'error',
  },

  // Production specific
  production: {
    enableMinification: true,
    enableCompression: true,
    enableCDN: false,
    enableServiceWorker: true,
  },
};

// Environment-specific overrides
if (import.meta.env.PROD) {
  // Production overrides
  config.development.enableMockData = false;
  config.development.enableDebugMode = false;
  config.errorHandling.enableErrorReporting = true;
  config.monitoring.enableAnalytics = true;
  config.monitoring.enablePerformanceMonitoring = true;
  config.monitoring.enableErrorTracking = true;
}

if (import.meta.env.DEV) {
  // Development overrides
  config.api.baseURL = 'http://localhost:5001/api/v1';
  config.development.enableMockData = true;
  config.development.enableDebugMode = true;
  config.features.enableRealTimeUpdates = false;
}

export default config;
