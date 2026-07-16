import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { adminService } from '@/services/admin.service';
import type { OrderStatus } from '@/types';

/** Painel do admin: polling continuo para novos pedidos chegarem sozinhos. */
export function useAdminOrders(page = 0) {
  return useQuery({
    queryKey: ['admin-orders', page],
    queryFn: () => adminService.listOrders(page),
    refetchInterval: 5000,
  });
}

export function useUpdateOrderStatus() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      uuid,
      status,
      estimatedMinutes,
    }: {
      uuid: string;
      status: OrderStatus;
      estimatedMinutes?: number;
    }) => adminService.updateOrderStatus(uuid, status, estimatedMinutes),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-orders'] });
      queryClient.invalidateQueries({ queryKey: ['orders'] });
    },
  });
}
