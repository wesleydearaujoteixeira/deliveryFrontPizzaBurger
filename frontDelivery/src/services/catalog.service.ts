import { api } from './api';
import type { Category, Page, Product, StoreStatus } from '@/types';

export const catalogService = {
  categories: () => api.get<Category[]>('/categories').then((r) => r.data),

  /** Status publico da loja: aberto/fechado, taxa, tempo estimado e pedido minimo. */
  storeStatus: () => api.get<StoreStatus>('/store/status').then((r) => r.data),

  products: (category?: string, page = 0, size = 20) =>
    api
      .get<Page<Product>>('/products', { params: { category, page, size } })
      .then((r) => r.data),
};
