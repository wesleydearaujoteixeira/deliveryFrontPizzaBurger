import { api } from './api';
import type { DeliveryAddress, Order, Page, PaymentMethod } from '@/types';

export interface CreateOrderPayload {
  items: { productUuid: string; quantity: number }[];
  paymentMethod: PaymentMethod;
  address: DeliveryAddress;
  note?: string;
}

export const orderService = {
  create: (payload: CreateOrderPayload) =>
    api.post<Order>('/orders', payload).then((r) => r.data),

  mine: (page = 0) =>
    api.get<Page<Order>>('/orders', { params: { page } }).then((r) => r.data),

  byUuid: (uuid: string) => api.get<Order>(`/orders/${uuid}`).then((r) => r.data),
};
