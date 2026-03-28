import axios, { InternalAxiosRequestConfig, AxiosError, AxiosResponse } from 'axios';

//const baseUrl = 'http://103.176.179.125:5244';
const baseUrl = 'http://localhost:5244';


const rootApi = axios.create({
  baseURL: `${baseUrl}/api`,
  headers: {
    'Content-Type': 'application/json',
  },
});

// 1. Interceptor cho Request (Giữ nguyên của bạn)
rootApi.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = localStorage.getItem('accessToken');
    if (token && config.headers) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error: AxiosError) => {
    return Promise.reject(error);
  }
);

rootApi.interceptors.response.use(
  (response: AxiosResponse) => {
    return response;
  },
  (error: AxiosError) => {
 
    if (error.response && error.response.status === 401) {
      console.error("Phiên đăng nhập hết hạn hoặc không có quyền truy cập.");
      
      localStorage.removeItem('accessToken');
      localStorage.removeItem('user'); 

      if (typeof window !== 'undefined') {
        window.location.href = '/login'; 
      }
    }
    
    return Promise.reject(error);
  }
);

export { rootApi, baseUrl };