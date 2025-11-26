import axios, { AxiosInstance } from 'axios';
import { ApiError } from '../types';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080/api';

let axiosInstance: AxiosInstance | null = null;
let token: string | null = localStorage.getItem('auth_token');

const createAxiosInstance = () => {
  const instance = axios.create({
    baseURL: API_BASE_URL,
    headers: {
      'Content-Type': 'application/json',
    },
  });

  // Request interceptor - thêm token
  instance.interceptors.request.use((config: any) => {
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  });

  // Response interceptor - xử lý error
  instance.interceptors.response.use(
    (response) => response,
    (error) => {
      if (error.response?.status === 401) {
        clearToken();
        window.location.href = '/login';
      }
      return Promise.reject(error);
    }
  );

  return instance;
};

const getAxiosInstance = () => {
  if (!axiosInstance) {
    axiosInstance = createAxiosInstance();
  }
  return axiosInstance;
};

const handleError = (error: any): ApiError => {
  if (axios.isAxiosError(error)) {
    return {
      message: error.response?.data?.message || error.message || 'API Error',
      status: error.response?.status || 500,
      data: error.response?.data,
    };
  }
  return {
    message: 'Unknown error occurred',
    status: 500,
  };
};

export const setToken = (newToken: string) => {
  token = newToken;
  localStorage.setItem('auth_token', newToken);
};

export const clearToken = () => {
  token = null;
  localStorage.removeItem('auth_token');
};

export const getToken = () => {
  return token;
};

export const get = async <T>(endpoint: string): Promise<{ data: T | null; error: ApiError | null }> => {
  try {
    const { data } = await getAxiosInstance().get<T>(endpoint);
    return { data, error: null };
  } catch (error) {
    return { data: null, error: handleError(error) };
  }
};

export const post = async <T>(endpoint: string, body: any): Promise<{ data: T | null; error: ApiError | null }> => {
  try {
    const { data } = await getAxiosInstance().post<T>(endpoint, body);
    return { data, error: null };
  } catch (error) {
    return { data: null, error: handleError(error) };
  }
};

export const put = async <T>(endpoint: string, body: any): Promise<{ data: T | null; error: ApiError | null }> => {
  try {
    const { data } = await getAxiosInstance().put<T>(endpoint, body);
    return { data, error: null };
  } catch (error) {
    return { data: null, error: handleError(error) };
  }
};

export const patch = async <T>(endpoint: string, body: any): Promise<{ data: T | null; error: ApiError | null }> => {
  try {
    const { data } = await getAxiosInstance().patch<T>(endpoint, body);
    return { data, error: null };
  } catch (error) {
    return { data: null, error: handleError(error) };
  }
};

export const httpDelete = async <T>(endpoint: string): Promise<{ data: T | null; error: ApiError | null }> => {
  try {
    const { data } = await getAxiosInstance().delete<T>(endpoint);
    return { data, error: null };
  } catch (error) {
    return { data: null, error: handleError(error) };
  }
};
