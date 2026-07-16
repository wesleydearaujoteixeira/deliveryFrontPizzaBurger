import axios from 'axios';

/**
 * Cliente HTTP unico. withCredentials envia os cookies HttpOnly.
 * Nenhum token e manipulado em JavaScript.
 */
export const api = axios.create({
  baseURL: '/api/v1',
  withCredentials: true,
});

let refreshing: Promise<void> | null = null;

// Interceptor: em 401, tenta renovar a sessao uma unica vez e repete a chamada
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const original = error.config;
    const isAuthRoute = original?.url?.startsWith('/auth');
    if (error.response?.status === 401 && !original._retried && !isAuthRoute) {
      original._retried = true;
      refreshing ??= api
        .post('/auth/refresh')
        .then(() => undefined)
        .finally(() => (refreshing = null));
      try {
        await refreshing;
        return api(original);
      } catch {
        /* refresh falhou: usuario precisa logar de novo */
      }
    }
    return Promise.reject(error);
  },
);
