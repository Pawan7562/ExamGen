// Professional API service with retry logic and error handling
import axios from 'axios';
import config from '../config/production';

// Create axios instance with production configuration
const api = axios.create({
  baseURL: config.api.baseURL,
  timeout: config.api.timeout,
  headers: {
    'Content-Type': 'application/json',
    'X-App-Version': config.app.version,
    'X-App-Environment': config.app.environment,
  },
});

// Request interceptor
api.interceptors.request.use(
  (config) => {
    // Add authentication token
    const token = localStorage.getItem('auth-token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // Add request ID for tracking
    config.headers['X-Request-ID'] = generateRequestId();

    // Log in development
    if (import.meta.env.DEV) {
      console.log(`🔍 API Request: ${config.method?.toUpperCase()} ${config.url}`, {
        headers: config.headers,
        params: config.params,
        data: config.data,
      });
    }

    return config;
  },
  (error) => {
    console.error('❌ Request interceptor error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor with retry logic
api.interceptors.response.use(
  (response) => {
    // Log in development
    if (import.meta.env.DEV) {
      console.log(`✅ API Response: ${response.status} ${response.config.method?.toUpperCase()} ${response.config.url}`, {
        data: response.data,
        headers: response.headers,
      });
    }

    return response;
  },
  async (error) => {
    const originalRequest = error.config;

    // Log in development
    if (import.meta.env.DEV) {
      console.error(`❌ API Error: ${error.response?.status || 'No status'} ${error.config?.method?.toUpperCase()} ${error.config?.url}`, {
        error: error.response?.data,
        headers: error.config?.headers,
      });
    }

    // Handle token refresh
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const newToken = await refreshToken();
        if (newToken) {
          localStorage.setItem('auth-token', newToken);
          originalRequest.headers.Authorization = `Bearer ${newToken}`;
          return api(originalRequest);
        }
      } catch (refreshError) {
        // Refresh failed, redirect to login
        handleAuthError();
        return Promise.reject(refreshError);
      }
    }

    // Retry logic for network errors
    if (!error.response && originalRequest._retryCount < config.errorHandling.maxRetries) {
      originalRequest._retryCount = originalRequest._retryCount || 0;
      originalRequest._retryCount++;

      // Exponential backoff
      const delay = config.errorHandling.retryDelay * Math.pow(2, originalRequest._retryCount - 1);
      
      console.log(`🔄 Retrying request (${originalRequest._retryCount}/${config.errorHandling.maxRetries}) after ${delay}ms`);

      await new Promise(resolve => setTimeout(resolve, delay));
      return api(originalRequest);
    }

    // Handle specific error cases
    if (error.response?.status === 401) {
      handleAuthError();
    }

    if (error.response?.status === 403) {
      handleForbiddenError();
    }

    if (error.response?.status >= 500) {
      handleServerError(error);
    }

    return Promise.reject(error);
  }
);

// Utility functions
const generateRequestId = () => {
  return Math.random().toString(36).substring(2) + Date.now().toString(36);
};

const refreshToken = async () => {
  try {
    const response = await axios.post(`${config.api.baseURL}/auth/refresh`, {
      token: localStorage.getItem('refresh-token'),
    });
    return response.data.token;
  } catch (error) {
    console.error('❌ Token refresh failed:', error);
    return null;
  }
};

const handleAuthError = () => {
  console.warn('🔐 Authentication error - clearing tokens and redirecting');
  localStorage.removeItem('auth-token');
  localStorage.removeItem('refresh-token');
  localStorage.removeItem('user');
  
  if (window.location.pathname !== config.auth.logoutRedirect) {
    window.location.href = config.auth.logoutRedirect;
  }
};

const handleForbiddenError = () => {
  console.warn('🚫 Access forbidden - insufficient permissions');
  // You could show a notification here
};

const handleServerError = (error) => {
  console.error('💥 Server error:', error);
  // You could show a user-friendly error message here
};

// API service methods
class ApiService {
  // Generic request method
  static async request(config) {
    try {
      const response = await api(config);
      return {
        success: true,
        data: response.data,
        status: response.status,
        headers: response.headers,
      };
    } catch (error) {
      return {
        success: false,
        error: {
          message: error.response?.data?.message || error.message,
          status: error.response?.status || 0,
          data: error.response?.data || null,
        },
      };
    }
  }

  // HTTP methods
  static async get(url, params = {}) {
    return this.request({ method: 'GET', url, params });
  }

  static async post(url, data = {}) {
    return this.request({ method: 'POST', url, data });
  }

  static async put(url, data = {}) {
    return this.request({ method: 'PUT', url, data });
  }

  static async patch(url, data = {}) {
    return this.request({ method: 'PATCH', url, data });
  }

  static async delete(url) {
    return this.request({ method: 'DELETE', url });
  }

  // File upload
  static async upload(url, file, onProgress) {
    const formData = new FormData();
    formData.append('file', file);

    return this.request({
      method: 'POST',
      url,
      data: formData,
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      onUploadProgress: onProgress,
    });
  }

  // Download
  static async download(url, filename) {
    try {
      const response = await api.get(url, {
        responseType: 'blob',
      });

      const blob = new Blob([response.data]);
      const downloadUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(downloadUrl);

      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: {
          message: error.message,
        },
      };
    }
  }
}

export default ApiService;
