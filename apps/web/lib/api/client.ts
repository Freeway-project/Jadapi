import axios, { AxiosResponse, AxiosError } from 'axios';

export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;

// Token management
export const tokenManager = {
  getToken: () => {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('authToken');
      console.log('[Token Manager] Getting token:', token ? `${token.substring(0, 20)}...` : 'null');
      return token;
    }
    return null;
  },
  setToken: (token: string) => {
    if (typeof window !== 'undefined') {
      console.log('[Token Manager] Setting token:', token ? `${token.substring(0, 20)}...` : 'null');
      localStorage.setItem('authToken', token);
    }
  },
  removeToken: () => {
    if (typeof window !== 'undefined') {
      console.log('[Token Manager] Removing token');
      localStorage.removeItem('authToken');
    }
  },
};

// Create shared axios instance
export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 50000,
});

// Request interceptor to add JWT token
apiClient.interceptors.request.use(
  (config) => {
    const token = tokenManager.getToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
      console.log('[API Client] Token attached to request:', config.url);
    } else {
      console.warn('[API Client] No token found for request:', config.url);
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor for error handling
apiClient.interceptors.response.use(
  (response: AxiosResponse) => response,
  (error: AxiosError<any>) => {
    const errorMessage = error.response?.data?.error ||
                        error.response?.data?.message ||
                        error.message ||
                        'Unknown error';

    // If 401, clear token
    if (error.response?.status === 401) {
      tokenManager.removeToken();
    }

    throw new APIError(errorMessage, error.response?.status);
  }
);

export class APIError extends Error {
  constructor(message: string, public status?: number) {
    super(message);
    this.name = 'APIError';
  }
}
