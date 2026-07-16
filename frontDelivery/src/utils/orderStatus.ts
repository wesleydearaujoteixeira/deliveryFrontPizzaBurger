import type { OrderStatus, PaymentMethod } from '@/types';

/** Etapas do fluxo feliz, na ordem exibida na timeline. */
export const ORDER_STEPS: OrderStatus[] = [
  'RECEIVED',
  'PREPARING',
  'OVEN',
  'READY',
  'OUT_FOR_DELIVERY',
  'DELIVERED',
];

export const STATUS_LABEL: Record<OrderStatus, string> = {
  RECEIVED: 'Pedido recebido',
  PREPARING: 'Em preparo',
  OVEN: 'No forno',
  READY: 'Pronto para entrega',
  OUT_FOR_DELIVERY: 'Saiu para entrega',
  DELIVERED: 'Entregue',
  CANCELLED: 'Cancelado',
};

export const PAYMENT_LABEL: Record<PaymentMethod, string> = {
  PIX: 'Pix',
  CARD: 'Cartao na entrega',
  CASH: 'Dinheiro',
};
