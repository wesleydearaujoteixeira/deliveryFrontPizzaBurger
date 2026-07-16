import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { orderService, type CreateOrderPayload } from '@/services/order.service';
import type { OrderStatus } from '@/types';

const FINAL_STATUSES: OrderStatus[] = ['DELIVERED', 'CANCELLED'];

export function useCreateOrder() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateOrderPayload) => orderService.create(payload),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['orders'] }),
  });
}

export function useMyOrders(page = 0) {
  return useQuery({
    queryKey: ['orders', page],
    queryFn: () => orderService.mine(page),
  });
}

/** Detalhe do pedido com polling enquanto ainda esta em andamento. */
export function useOrder(uuid: string | undefined) {
  return useQuery({
    queryKey: ['orders', 'detail', uuid],
    queryFn: () => orderService.byUuid(uuid!),
    enabled: !!uuid,
    refetchInterval: (query) => {
      const status = query.state.data?.status;
      return status && !FINAL_STATUSES.includes(status) ? 5000 : false;
    },
  });
}
