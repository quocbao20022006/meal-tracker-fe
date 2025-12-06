import axios, { AxiosInstance } from 'axios';
import { ApiError } from '../types';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080/api';

let axiosInstance: AxiosInstance | null = null;
let token: string | null = localStorage.getItem('auth_token');
console.log('Loaded token from localStorage:', token);

const createAxiosInstance = () => {
  const instance = axios.create({
    baseURL: API_BASE_URL,
    // Không set default Content-Type để axios tự động detect
    transformRequest: [
      (data, headers) => {
        // Nếu data là FormData, không transform và để browser tự xử lý
        if (data instanceof FormData) {
          // Xóa Content-Type để browser tự động set với boundary
          delete headers['Content-Type'];
          delete headers['content-type'];
          return data; // Trả về FormData nguyên bản, không transform
        }
        // Với data khác, transform thành JSON
        if (headers['Content-Type'] === undefined) {
          headers['Content-Type'] = 'application/json';
        }
        return JSON.stringify(data);
      }
    ],
  });

  // Request interceptor - thêm token
  instance.interceptors.request.use((config: any) => {
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    // Nếu body là FormData, đảm bảo không có Content-Type
    if (config.data instanceof FormData) {
      delete config.headers['Content-Type'];
      delete config.headers['content-type'];
      
      // Log để debug
      console.log("📤 Sending FormData - Content-Type will be auto-set by browser");
      console.log("FormData entries:", Array.from((config.data as FormData).entries()).map(([k, v]) => 
        v instanceof File ? `${k}: File(${v.name})` : `${k}: ${typeof v}`
      ));
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

export const put = async <T>(endpoint: string, body: any, config?: { headers?: Record<string, string> }): Promise<{ data: T | null; error: ApiError | null }> => {
  try {
    // Nếu body là FormData, sử dụng fetch API trực tiếp để đảm bảo Content-Type đúng
    if (body instanceof FormData) {
      const url = `${API_BASE_URL}${endpoint}`;
      const headers: HeadersInit = {};
      
      // Thêm Authorization header nếu có token
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
      
      // QUAN TRỌNG: Không set Content-Type header
      // Browser sẽ tự động set Content-Type: multipart/form-data với boundary khi gửi FormData
      console.log("📤 Using fetch API for FormData");
      console.log("FormData entries:", Array.from(body.entries()).map(([k, v]) => 
        v instanceof File ? `${k}: File` : `${k}: ${typeof v}`
      ));
      
      const response = await fetch(url, {
        method: 'PUT',
        headers: headers, // Chỉ có Authorization, không có Content-Type
        body: body, // FormData - browser sẽ tự động set Content-Type
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: response.statusText }));
        return {
          data: null,
          error: {
            message: errorData.message || 'Request failed',
            status: response.status,
            data: errorData,
          },
        };
      }
      
      const data = await response.json();
      return { data, error: null };
    }
    
    // Với body không phải FormData, sử dụng axios như bình thường
    const axiosConfig: any = {};
    if (config?.headers) {
      axiosConfig.headers = config.headers;
    }
    
    const { data } = await getAxiosInstance().put<T>(endpoint, body, axiosConfig);
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
