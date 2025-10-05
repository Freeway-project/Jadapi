import axios, { AxiosResponse, AxiosError } from 'axios';

export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;

// Create shared axios instance
export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 20000,

});

// Response interceptor for error handling
apiClient.interceptors.response.use(
  (response: AxiosResponse) => response,
  (error: AxiosError<any>) => {
    const errorMessage = error.response?.data?.error ||
                        error.response?.data?.message ||
                        error.message ||
                        'Unknown error';

    throw new APIError(errorMessage, error.response?.status);
  }
);

export class APIError extends Error {
  constructor(message: string, public status?: number) {
    super(message);
    this.name = 'APIError';
  }
}
