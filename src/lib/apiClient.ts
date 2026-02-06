import { supabase } from './supabase';

interface ApiRequestOptions extends RequestInit {
  requireAuth?: boolean;
  skipRefresh?: boolean;
}

class ApiClient {
  private baseURL: string;
  private isRefreshing: boolean = false;
  private refreshSubscribers: Array<(token: string) => void> = [];

  constructor(baseURL: string) {
    this.baseURL = baseURL;
  }

  private async getAccessToken(): Promise<string | null> {
    const { data: { session } } = await supabase.auth.getSession();
    return session?.access_token || null;
  }

  private async refreshAccessToken(): Promise<string | null> {
    if (this.isRefreshing) {
      return new Promise((resolve) => {
        this.refreshSubscribers.push((token) => resolve(token));
      });
    }

    this.isRefreshing = true;

    try {
      const { data, error } = await supabase.auth.refreshSession();

      if (error) {
        throw error;
      }

      const newToken = data.session?.access_token || null;

      this.refreshSubscribers.forEach((callback) => {
        callback(newToken || '');
      });
      this.refreshSubscribers = [];

      return newToken;
    } catch (error) {
      this.refreshSubscribers.forEach((callback) => {
        callback('');
      });
      this.refreshSubscribers = [];
      return null;
    } finally {
      this.isRefreshing = false;
    }
  }

  private async handleRequestError(response: Response): Promise<never> {
    const contentType = response.headers.get('content-type');
    let errorMessage = '请求失败';

    if (contentType?.includes('application/json')) {
      const errorData = await response.json();
      errorMessage = errorData.message || errorData.error || errorMessage;
    }

    throw new Error(errorMessage);
  }

  private async handle401Error(): Promise<string | null> {
    const newToken = await this.refreshAccessToken();

    if (!newToken) {
      await supabase.auth.signOut();
      window.location.href = '/select-user';
      return null;
    }

    return newToken;
  }

  async request<T>(endpoint: string, options: ApiRequestOptions = {}): Promise<T> {
    const {
      requireAuth = true,
      skipRefresh = false,
      headers: customHeaders = {},
      ...fetchOptions
    } = options;

    let token: string | null = null;

    if (requireAuth) {
      token = await this.getAccessToken();
    }

    const url = `${this.baseURL}${endpoint}`;
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...customHeaders,
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    let response = await fetch(url, {
      ...fetchOptions,
      headers,
    });

    if (response.status === 401 && !skipRefresh && requireAuth) {
      const newToken = await this.handle401Error();

      if (newToken) {
        headers['Authorization'] = `Bearer ${newToken}`;
        response = await fetch(url, {
          ...fetchOptions,
          headers,
        });
      }
    }

    if (!response.ok) {
      await this.handleRequestError(response);
    }

    return response.json();
  }

  async get<T>(endpoint: string, options?: ApiRequestOptions): Promise<T> {
    return this.request<T>(endpoint, {
      ...options,
      method: 'GET',
    });
  }

  async post<T>(endpoint: string, data?: any, options?: ApiRequestOptions): Promise<T> {
    return this.request<T>(endpoint, {
      ...options,
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async put<T>(endpoint: string, data?: any, options?: ApiRequestOptions): Promise<T> {
    return this.request<T>(endpoint, {
      ...options,
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async patch<T>(endpoint: string, data?: any, options?: ApiRequestOptions): Promise<T> {
    return this.request<T>(endpoint, {
      ...options,
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  async delete<T>(endpoint: string, options?: ApiRequestOptions): Promise<T> {
    return this.request<T>(endpoint, {
      ...options,
      method: 'DELETE',
    });
  }
}

export const apiClient = new ApiClient(import.meta.env.VITE_SUPABASE_URL || '');
