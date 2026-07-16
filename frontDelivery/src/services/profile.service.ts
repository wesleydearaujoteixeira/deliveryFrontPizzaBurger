import { api } from './api';
import type { User } from '@/types';

export const profileService = {
  /**
   * Multipart como no cadastro de produtos: parte 'data' com o JSON
   * (name, phone) e parte 'avatar' opcional com a foto. A foto fica no
   * banco e e servida em /users/{uuid}/avatar.
   */
  update: (data: { name: string; phone?: string }, avatar?: File) => {
    const form = new FormData();
    form.append('data', new Blob([JSON.stringify(data)], { type: 'application/json' }));
    if (avatar) form.append('avatar', avatar);
    return api.patch<User>('/me', form).then((r) => r.data);
  },

  /** Conta local exige a senha atual; conta Google exclui direto. */
  deleteAccount: (password?: string) =>
    api.delete('/me', { data: password ? { password } : {} }),
};
