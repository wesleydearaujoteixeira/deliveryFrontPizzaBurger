import { useMutation, useQueryClient } from '@tanstack/react-query';
import { adminService, type CreateProductPayload } from '@/services/admin.service';
import type { StoreStatus } from '@/types';

export function useUpdateStoreStatus() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: Partial<StoreStatus>) => adminService.updateStoreStatus(data),
    onSuccess: (status) => queryClient.setQueryData(['store-status'], status),
  });
}

export function useCreateProduct() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ data, image }: { data: CreateProductPayload; image?: File }) =>
      adminService.createProduct(data, image),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['products'] }),
  });
}

export function useDeleteProduct() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (uuid: string) => adminService.deleteProduct(uuid),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['products'] }),
  });
}
