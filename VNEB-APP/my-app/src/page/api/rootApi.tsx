import axios, { InternalAxiosRequestConfig, AxiosError } from 'axios';

const baseUrl = 'http://103.176.179.125:5244';

const rootApi = axios.create({
  baseURL: `${baseUrl}/api`,
  headers: {
    'Content-Type': 'application/json',
  },
});

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

export { rootApi, baseUrl };