import { api } from './api';
import type { RegistrationPending, User } from '@/types';

export const authService = {
  /** Passo 1: envia o codigo de confirmacao para o e-mail (nao cria a conta). */
  register: (data: { name: string; email: string; password: string }) =>
    api.post<RegistrationPending>('/auth/register', data).then((r) => r.data),

  /** Passo 2: confirma o codigo recebido; a conta e criada e ja autenticada. */
  confirmRegistration: (data: { email: string; code: string }) =>
    api.post<User>('/auth/register/confirm', data).then((r) => r.data),

  resendRegistrationCode: (email: string) =>
    api.post<RegistrationPending>('/auth/register/resend', { email }).then((r) => r.data),

  login: (data: { email: string; password: string }) =>
    api.post<User>('/auth/login', data).then((r) => r.data),

  logout: () => api.post('/auth/logout'),

  me: () => api.get<User>('/me').then((r) => r.data),

  /**
   * Redireciona para o fluxo OAuth do Google no backend.
   * Em dev a URL relativa passa pelo proxy do Vite (host localhost:8080,
   * que e a redirect URI registrada no Google). No build de producao local
   * vamos direto ao backend na 8080 pelo mesmo motivo; apos autenticar,
   * o backend devolve o usuario para a origem que iniciou o login.
   */
  loginWithGoogle: () => {
    const backendOrigin =
      import.meta.env.VITE_BACKEND_ORIGIN ?? (import.meta.env.DEV ? '' : 'http://localhost:8080');
    window.location.href = `${backendOrigin}/oauth2/authorization/google`;
  },
};
