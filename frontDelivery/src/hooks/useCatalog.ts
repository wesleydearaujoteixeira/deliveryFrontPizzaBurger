import { useQuery } from '@tanstack/react-query';
import { catalogService } from '@/services/catalog.service';

export function useCategories() {
  return useQuery({ queryKey: ['categories'], queryFn: catalogService.categories });
}

export function useStoreStatus() {
  return useQuery({
    queryKey: ['store-status'],
    queryFn: catalogService.storeStatus,
    refetchInterval: 60_000, // cliente ve a loja abrir/fechar sem recarregar
  });
}

export function useProducts(category?: string, page = 0, size = 20) {
  return useQuery({
    queryKey: ['products', category, page, size],
    queryFn: () => catalogService.products(category, page, size),
  });
}
