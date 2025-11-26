import axios, { AxiosInstance } from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080/api';

class APIClient {
  private client: AxiosInstance;
  private token: string | null = null;

  constructor(baseURL: string) {
    this.token = localStorage.getItem('auth_token');
    
    this.client = axios.create({
      baseURL,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Thêm token vào mỗi request
    this.client.interceptors.request.use((config: any) => {
      if (this.token) {
        config.headers.Authorization = `Bearer ${this.token}`;
      }
      return config;
    });

    // Xử lý error
    this.client.interceptors.response.use(
      (response: any) => response,
      (error: any) => {
        if (error.response?.status === 401) {
          this.clearToken();
          window.location.href = '/login';
        }
        return Promise.reject(error);
      }
    );
  }

  setToken(token: string) {
    this.token = token;
    localStorage.setItem('auth_token', token);
  }

  clearToken() {
    this.token = null;
    localStorage.removeItem('auth_token');
  }

  // Auth endpoints
  async signUp(email: string, password: string) {
    try {
      const { data } = await this.client.post('/auth/signup', { email, password });
      if (data.token) this.setToken(data.token);
      return { data, error: null };
    } catch (error: any) {
      return { data: null, error };
    }
  }

  async signIn(email: string, password: string) {
    try {
      const { data } = await this.client.post('/auth/login', { email, password });
      if (data.token) this.setToken(data.token);
      return { data, error: null };
    } catch (error: any) {
      return { data: null, error };
    }
  }

  async signOut() {
    this.clearToken();
  }

  // Generic methods
  async get(endpoint: string) {
    try {
      const { data } = await this.client.get(endpoint);
      return { data, error: null };
    } catch (error: any) {
      return { data: null, error };
    }
  }

  async post(endpoint: string, body: any) {
    try {
      const { data } = await this.client.post(endpoint, body);
      return { data, error: null };
    } catch (error: any) {
      return { data: null, error };
    }
  }

  async put(endpoint: string, body: any) {
    try {
      const { data } = await this.client.put(endpoint, body);
      return { data, error: null };
    } catch (error: any) {
      return { data: null, error };
    }
  }

  async delete(endpoint: string) {
    try {
      const { data } = await this.client.delete(endpoint);
      return { data, error: null };
    } catch (error: any) {
      return { data: null, error };
    }
  }
}

export const api = new APIClient(API_BASE_URL);

// Legacy wrapper - use services and hooks instead
// All auth operations should be handled via useAuth hook with auth.service
