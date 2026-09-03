import axios from 'axios';

const rawBaseURL = import.meta.env.VITE_API_URL || 'http://localhost:3000';
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

// Interceptor de resposta: token expirado/inválido → logout automático
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      const wasLoggedIn = localStorage.getItem('token') !== null;
      localStorage.removeItem('token');
      // Redireciona ao login apenas se havia sessão (evita loop no próprio login)
      if (wasLoggedIn && !window.location.pathname.startsWith('/login')) {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

// Helper para extrair mensagem de erro legível de qualquer falha axios
export function getApiErrorMessage(err: unknown, fallback: string): string {
  if (axios.isAxiosError(err)) {
    const data = err.response?.data as { error?: string; errors?: { message: string }[] } | undefined;
    if (data?.error) return data.error;
    if (data?.errors?.length) return data.errors.map((e) => e.message).join(', ');
    if (err.code === 'ERR_NETWORK') return 'Sem conexão com o servidor. Verifique sua internet.';
  }
  return fallback;
}

export default api;
