import { useState } from 'react';
import { Link } from 'react-router';
import { ChevronLeft, ChevronRight, ReceiptText } from 'lucide-react';
import { useMyOrders } from '@/hooks/useOrders';
import { Card } from '@/components/ui/Card';
import { Skeleton } from '@/components/ui/Skeleton';
import { Button } from '@/components/ui/Button';
import { OrderStatusChip } from '@/components/OrderStatusChip';
import { formatBRL } from '@/utils/currency';

export function OrdersPage() {
  const [page, setPage] = useState(0);
  const { data, isLoading } = useMyOrders(page);

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-extrabold">Meus pedidos</h1>

      {isLoading && (
        <div className="flex flex-col gap-4">
          {Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-28" />)}
        </div>
      )}

      {data && data.content.length === 0 && (
        <div className="flex flex-col items-center gap-4 py-16 text-center">
          <ReceiptText className="h-12 w-12 text-zinc-300 dark:text-zinc-600" aria-hidden />
          <p className="font-medium">Voce ainda nao fez nenhum pedido</p>
          <Link to="/">
            <Button variant="primary">Ver cardapio</Button>
          </Link>
        </div>
      )}

      <div className="flex flex-col gap-4">
        {data?.content.map((order) => {
          const itemCount = order.items.reduce((sum, i) => sum + i.quantity, 0);
          return (
            <Link key={order.uuid} to={`/pedidos/${order.uuid}`}>
              <Card hoverable className="flex flex-col gap-2">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="font-bold">
                    Pedido #{order.uuid.slice(0, 8).toUpperCase()}
                  </span>
                  <OrderStatusChip status={order.status} />
                </div>
                <p className="line-clamp-1 text-sm text-zinc-500">
                  {itemCount} {itemCount === 1 ? 'item' : 'itens'} ·{' '}
                  {order.items.map((i) => i.name).join(', ')}
                </p>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-zinc-400">
                    {new Date(order.createdAt).toLocaleString('pt-BR', {
                      day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit',
                    })}
                  </span>
                  <span className="font-bold">{formatBRL(order.total)}</span>
                </div>
              </Card>
            </Link>
          );
        })}
      </div>

      {data && data.totalPages > 1 && (
        <div className="flex items-center justify-center gap-4">
          <Button
            variant="secondary"
            disabled={page === 0}
            onClick={() => setPage((p) => p - 1)}
            aria-label="Pagina anterior"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <span className="text-sm text-zinc-500">
            {page + 1} de {data.totalPages}
          </span>
          <Button
            variant="secondary"
            disabled={page + 1 >= data.totalPages}
            onClick={() => setPage((p) => p + 1)}
            aria-label="Proxima pagina"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      )}
    </div>
  );
}
