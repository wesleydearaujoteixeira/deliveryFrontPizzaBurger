import { api } from './api';
import type { Order, OrderStatus, Page, Product, StoreStatus } from '@/types';

export interface CreateProductPayload {
  categoryUuid: string;
  name: string;
  description: string;
  type: Product['type'];
  basePrice: number;
}

export const adminService = {
  /**
   * Multipart: parte 'data' com o JSON do produto e parte 'image' opcional.
   * A imagem fica no banco e e servida em /products/{uuid}/image.
   */
  createProduct: (data: CreateProductPayload, image?: File) => {
    const form = new FormData();
    form.append('data', new Blob([JSON.stringify(data)], { type: 'application/json' }));
    if (image) form.append('image', image);
    return api.post<Product>('/admin/products', form).then((r) => r.data);
  },

  deleteProduct: (uuid: string) => api.delete(`/admin/products/${uuid}`),

  listOrders: (page = 0, status?: OrderStatus) =>
    api
      .get<Page<Order>>('/admin/orders', { params: { page, status } })
      .then((r) => r.data),

  /** Atualizacao parcial: envie so os campos que mudaram. */
  updateStoreStatus: (data: Partial<StoreStatus>) =>
    api.patch<StoreStatus>('/admin/store/status', data).then((r) => r.data),

  /** estimatedMinutes e obrigatorio ao confirmar (RECEIVED -> PREPARING). */
  updateOrderStatus: (uuid: string, status: OrderStatus, estimatedMinutes?: number) =>
    api
      .patch<Order>(`/admin/orders/${uuid}/status`, { status, estimatedMinutes })
      .then((r) => r.data),
};
