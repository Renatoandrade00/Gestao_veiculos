import axios from 'axios';

const rawBaseURL = (import.meta as any).env.VITE_API_URL || 'http://localhost:3000';
const api = axios.create({
  baseURL: rawBaseURL.endsWith('/api') ? rawBaseURL : `${rawBaseURL}/api`,
});

// Interceptor para adicionar o JWT nas requisições
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default api;
