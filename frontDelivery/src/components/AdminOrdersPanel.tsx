import { useState } from 'react';
import toast from 'react-hot-toast';
import { Bike, Check, ChevronLeft, ChevronRight, Clock, ReceiptText, X } from 'lucide-react';
import { useAdminOrders, useUpdateOrderStatus } from '@/hooks/useAdminOrders';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Skeleton } from '@/components/ui/Skeleton';
import { OrderStatusChip } from '@/components/OrderStatusChip';
import { formatBRL } from '@/utils/currency';
import type { Order } from '@/types';

const ESTIMATE_OPTIONS = [20, 30, 45, 60, 90];

export function AdminOrdersPanel() {
  const [page, setPage] = useState(0);
  const { data, isLoading } = useAdminOrders(page);

  const pending = data?.content.filter((o) => o.status === 'RECEIVED').length ?? 0;

  return (
    <div className="flex flex-col gap-4">
      {pending > 0 && (
        <p className="rounded-xl bg-amber-100 px-4 py-3 text-sm font-medium text-amber-800 dark:bg-amber-500/15 dark:text-amber-400">
          {pending} {pending === 1 ? 'pedido aguardando' : 'pedidos aguardando'} confirmacao
        </p>
      )}

      {isLoading && (
        <div className="flex flex-col gap-4">
          {Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-36" />)}
        </div>
      )}

      {data && data.content.length === 0 && (
        <div className="flex flex-col items-center gap-3 py-12 text-center">
          <ReceiptText className="h-10 w-10 text-zinc-300 dark:text-zinc-600" aria-hidden />
          <p className="text-sm text-zinc-500">Nenhum pedido por aqui ainda.</p>
        </div>
      )}

      {data?.content.map((order) => <AdminOrderCard key={order.uuid} order={order} />)}

      {data && data.totalPages > 1 && (
        <div className="flex items-center justify-center gap-4">
          <Button variant="secondary" disabled={page === 0}
            onClick={() => setPage((p) => p - 1)} aria-label="Pagina anterior">
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <span className="text-sm text-zinc-500">{page + 1} de {data.totalPages}</span>
          <Button variant="secondary" disabled={page + 1 >= data.totalPages}
            onClick={() => setPage((p) => p + 1)} aria-label="Proxima pagina">
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      )}
    </div>
  );
}

function AdminOrderCard({ order }: { order: Order }) {
  const updateStatus = useUpdateOrderStatus();
  const [estimate, setEstimate] = useState(45);
  const itemCount = order.items.reduce((sum, i) => sum + i.quantity, 0);

  const act = async (
    status: 'PREPARING' | 'CANCELLED' | 'OUT_FOR_DELIVERY',
    successMessage: string,
  ) => {
    try {
      await updateStatus.mutateAsync({
        uuid: order.uuid,
        status,
        estimatedMinutes: status === 'PREPARING' ? estimate : undefined,
      });
      toast.success(successMessage);
    } catch {
      toast.error('Nao foi possivel atualizar o pedido');
    }
  };

  return (
    <Card className="flex flex-col gap-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <span className="font-bold">#{order.uuid.slice(0, 8).toUpperCase()}</span>
          <span className="ml-2 text-sm text-zinc-500">
            {order.customerName} ·{' '}
            {new Date(order.createdAt).toLocaleTimeString('pt-BR', {
              hour: '2-digit', minute: '2-digit',
            })}
          </span>
        </div>
        <OrderStatusChip status={order.status} />
      </div>

      <p className="line-clamp-2 text-sm text-zinc-600 dark:text-zinc-300">
        {itemCount} {itemCount === 1 ? 'item' : 'itens'}:{' '}
        {order.items.map((i) => `${i.quantity}x ${i.name}`).join(', ')}
      </p>

      <div className="flex flex-wrap items-center justify-between gap-2 text-sm">
        <span className="text-zinc-500">
          {order.address.neighborhood}, {order.address.city}
          {order.estimatedMinutes && (
            <span className="ml-2 inline-flex items-center gap-1 text-zinc-400">
              <Clock className="h-3.5 w-3.5" aria-hidden /> ~{order.estimatedMinutes} min
            </span>
          )}
        </span>
        <span className="font-bold">{formatBRL(order.total)}</span>
      </div>

      {order.status === 'RECEIVED' && (
        <div className="flex flex-wrap items-center gap-2 border-t border-zinc-100 pt-3 dark:border-zinc-800">
          <label htmlFor={`estimate-${order.uuid}`} className="text-sm text-zinc-500">
            Entrega em
          </label>
          <select
            id={`estimate-${order.uuid}`}
            value={estimate}
            onChange={(e) => setEstimate(Number(e.target.value))}
            className="rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm outline-none
              focus:border-brand-500 dark:border-zinc-700 dark:bg-surface-dark-2 dark:text-zinc-100"
          >
            {ESTIMATE_OPTIONS.map((m) => (
              <option key={m} value={m}>{m} min</option>
            ))}
          </select>
          <Button
            className="px-4 py-2"
            isLoading={updateStatus.isPending}
            onClick={() => act('PREPARING', 'Pedido confirmado, cozinha avisada!')}
          >
            <Check className="h-4 w-4" /> Confirmar
          </Button>
          <Button
            variant="danger"
            className="px-4 py-2"
            isLoading={updateStatus.isPending}
            onClick={() => act('CANCELLED', 'Pedido recusado')}
          >
            <X className="h-4 w-4" /> Recusar
          </Button>
        </div>
      )}

      {order.status === 'READY' && (
        <div className="border-t border-zinc-100 pt-3 dark:border-zinc-800">
          <Button
            className="px-4 py-2"
            isLoading={updateStatus.isPending}
            onClick={() => act('OUT_FOR_DELIVERY', 'Pedido despachado para entrega!')}
          >
            <Bike className="h-4 w-4" /> Despachar entrega
          </Button>
        </div>
      )}
    </Card>
  );
}
